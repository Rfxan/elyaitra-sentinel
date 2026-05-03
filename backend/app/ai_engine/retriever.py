from rank_bm25 import BM25Okapi
from app.ai_engine.chroma_client import get_collection
from app.ai_engine.providers import get_provider
from app.ai_engine.embeddings import get_embeddings
from app.ai_engine import config
from flashrank import Ranker, RerankRequest

provider = get_provider()
embedding_model = get_embeddings()
_ranker = None

def get_ranker():
    global _ranker
    if _ranker is None:
        _ranker = Ranker(model_name="ms-marco-MiniLM-L-12-v2", cache_dir="/tmp/flashrank_cache")
    return _ranker

def embed(text: str) -> list[float]:
    return embedding_model.embed_query(text)

def _expand_query(question: str) -> list[str]:
    """Use LLM to generate 3 variations of the question for better retrieval."""
    if not config.QUERY_EXPANSION_ENABLED:
        return [question]
    
    prompt = f"""You are an AI assistant designed to improve search retrieval. 
Given a question, generate 3 different versions of it that capture the same intent but use different phrasing, technical terms, or perspectives.
Respond ONLY with the 3 variations, one per line. No headers, no numbers.

ORIGINAL QUESTION: {question}

VARIATIONS:"""
    
    try:
        response = provider.generate(prompt)
        variations = [v.strip("- ").strip() for v in response.split("\n") if v.strip()]
        # Filter out anything that looks like "Variations:" or the original question if returned as prefix
        variations = [v for v in variations if v.lower() not in {"variations:", "original question:"}]
        
        # Keep original + top 3 variations
        all_queries = [question] + variations[:3]
        print(f"🔄 QUERY EXPANSION | Original: '{question}' -> Variations: {all_queries[1:]}")
        return all_queries
    except Exception as e:
        print(f"⚠️ Query expansion failed: {e}")
        return [question]

def tokenize(text: str) -> list[str]:
    """Simple tokenizer for BM25."""
    return text.lower().replace("-", " ").replace("+", " ").split()

def retrieve(question: str, subject: str, unit: int | None = None, k: int | None = None, collection_name: str | None = None):
    try:
        if k is None:
            k = config.FINAL_RETRIEVAL_K
            
        initial_k = config.INITIAL_RETRIEVAL_K if config.RERANKER_ENABLED else k
        
        # 0. Query Expansion
        queries = _expand_query(question) if config.QUERY_EXPANSION_ENABLED else [question]
        
        # Use namespace override if provided (GAP-2: room isolation)
        coll_name = collection_name if collection_name else subject
        print(f"🔍 RETRIEVER | collection={coll_name} | queries={len(queries)} | k={k}")
        collection = get_collection(coll_name)
        # Optimize Quote: Use embed_documents to get all embeddings in ONE request
        all_embeddings = embedding_model.embed_documents(queries)
        
        all_stage1_docs = []
        seen_docs = set()

        for i, q in enumerate(queries):
            # 1. Vector Search (Semantic)
            emb = all_embeddings[i]
            where_clause = {"unit": str(unit)} if unit else None
            
            vector_results = collection.query(
                query_embeddings=[emb],
                n_results=initial_k,
                where=where_clause
            )
            
            vector_docs = vector_results.get("documents", [[]])[0]
            vector_ids = vector_results.get("ids", [[]])[0]

            # 2. Keyword Search (BM25) - Only if enabled and we have unit docs
            # (Note: BM25 on all queries might be slow, so we optimize)
            current_unit_docs = []
            if config.HYBRID_RETRIEVAL:
                all_unit_data = collection.get(where=where_clause)
                u_ids = all_unit_data.get("ids", [])
                u_docs = all_unit_data.get("documents", [])
                
                if u_docs:
                    tokenized_corpus = [tokenize(doc) for doc in u_docs]
                    bm25 = BM25Okapi(tokenized_corpus)
                    query_tokens = tokenize(q)
                    bm25_scores = bm25.get_scores(query_tokens)
                    bm25_ranked_indices = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)
                    current_unit_docs = [u_docs[i] for i in bm25_ranked_indices[:initial_k]]

            # Combine and deduplicate
            for doc in vector_docs + current_unit_docs:
                if doc not in seen_docs:
                    all_stage1_docs.append(doc)
                    seen_docs.add(doc)

        # 4. Reranking (Stage 2)
        if config.RERANKER_ENABLED and len(all_stage1_docs) > k:
            print(f"🔄 RERANKING | Pool: {len(all_stage1_docs)} chunks -> Target: {k}")
            ranker = get_ranker()
            passages = [{"id": i, "text": doc} for i, doc in enumerate(all_stage1_docs)]
            rerankrequest = RerankRequest(query=question, passages=passages)
            results = ranker.rerank(rerankrequest)
            
            final_docs = [r["text"] for r in results[:k]]
        else:
            final_docs = all_stage1_docs[:k]

        print(f"📊 Final result: {len(final_docs)} chunks returned")
        return final_docs

    except Exception as e:
        print("❌ Hybrid Retrieval error:", e)
        import traceback
        traceback.print_exc()
        return []


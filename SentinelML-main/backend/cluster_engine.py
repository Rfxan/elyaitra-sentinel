import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import logging

logger = logging.getLogger(__name__)

def perform_clustering(events):
    """
    Performs DBSCAN clustering on the raw features of the provided events.
    Returns a dictionary with cluster labels, PCA coordinates, and outlier counts.
    """
    try:
        # 1. Extract features
        X = np.array([e["features"] for e in events])
        if X.shape[0] < 5:
            return {
                "clusters": [], 
                "summaries": [], 
                "outliers": 0, 
                "total_events": len(events),
                "message": "Insufficient data for clustering"
            }

        # 2. Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # 3. DBSCAN
        # eps 0.3-0.5 is usually good for scaled network features, but min_samples=3 to catch small bursts
        db = DBSCAN(eps=0.5, min_samples=3)
        labels = db.fit_predict(X_scaled)

        # 4. PCA for 2D visualization
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_scaled)

        # 5. Format results
        clusters = []
        outliers = 0
        
        for i, event in enumerate(events):
            label = int(labels[i])
            if label == -1:
                outliers += 1
            
            clusters.append({
                "id": event["id"],
                "ip": event["ip"],
                "type": event["type"],
                "cluster_id": label,
                "x": float(X_pca[i, 0]),
                "y": float(X_pca[i, 1]),
                "is_outlier": label == -1
            })

        # Calculate cluster summaries
        unique_labels = set(labels)
        summaries = []
        for lab in unique_labels:
            if lab == -1: continue
            count = np.sum(labels == lab)
            summaries.append({
                "cluster_id": int(lab),
                "count": int(count)
            })

        return {
            "clusters": clusters,
            "summaries": summaries,
            "outliers": outliers,
            "total_events": len(events)
        }

    except Exception as e:
        logger.error(f"Clustering failed: {e}")
        return {
            "error": str(e), 
            "clusters": [], 
            "summaries": [], 
            "outliers": 0,
            "total_events": len(events) if 'events' in locals() else 0
        }

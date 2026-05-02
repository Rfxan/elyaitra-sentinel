from stix2 import Bundle, Indicator, AttackPattern, ObservedData, Identity, Relationship
from datetime import datetime, timezone
import uuid

def export_events_to_stix(events):
    """
    Converts AttackEvent SQLAlchemy models to STIX 2.1 Bundle.
    """
    author = Identity(name="Elyaitra Sentinel AI", identity_class="organization")
    objects = [author]
    
    MITRE_MAP = {
        "SQL Injection": "T1190",
        "RAG Bypass": "T1548",
        "Prompt Injection": "T1059.006",
        "Data Exfiltration": "T1020",
        "Reconnaissance": "T1595",
        "Enumeration": "T1046"
    }
    
    for event in events:
        mitre_id = MITRE_MAP.get(event.attack_type, "T1190")
        # Ensure timestamp has timezone
        ts = event.timestamp
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        # 1. Observed Data (The raw request)
        # In STIX 2.1, Observed Data can hold observables like IPv4 address
        obs_data = ObservedData(
            first_observed=ts,
            last_observed=ts,
            number_observed=1,
            created_by_ref=author.id
        )
        objects.append(obs_data)
        
        # 2. Attack Pattern (MITRE Mapping)
        pattern = AttackPattern(
            name=event.attack_type or "Unknown Attack",
            description=f"Query: {event.raw_query[:200]}",
            external_references=[
                {
                    "source_name": "mitre-attack",
                    "external_id": mitre_id
                }
            ]
        )
        objects.append(pattern)
        
        # 3. Indicator
        indicator = Indicator(
            name=f"Indicator for {event.attack_type}",
            pattern=f"[ipv4-addr:value = '{event.ip}']",
            pattern_type="stix",
            valid_from=ts
        )
        objects.append(indicator)
        
        # 4. Relationship: Indicator indicates Attack Pattern
        rel = Relationship(
            relationship_type="indicates",
            source_ref=indicator.id,
            target_ref=pattern.id
        )
        objects.append(rel)
        
    bundle = Bundle(objects=objects)
    return bundle.serialize(indent=4)

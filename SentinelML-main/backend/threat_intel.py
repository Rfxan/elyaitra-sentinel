MITRE_MAP = {
    0: {"id": "N/A",    "name": "Normal Traffic",          "tactic": "None"},
    1: {"id": "T1498",  "name": "Network DoS",             "tactic": "Impact"},
    2: {"id": "T1046",  "name": "Network Service Scan",    "tactic": "Discovery"},
    3: {"id": "T1078",  "name": "Valid Accounts (R2L)",    "tactic": "Initial Access"},
    4: {"id": "T1068",  "name": "Privilege Escalation",    "tactic": "Privilege Escalation"},
}

LABEL_NAMES = {
    0: "normal",
    1: "dos",
    2: "probe",
    3: "r2l",
    4: "u2r",
}

def get_mitre_tag(label: int) -> dict:
    return MITRE_MAP.get(label, MITRE_MAP[1])

def get_label_name(label: int) -> str:
    return LABEL_NAMES.get(label, "attack")

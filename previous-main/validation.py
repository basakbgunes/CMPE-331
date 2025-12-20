"""
Validation Engine for Flight Roster System
Handles all validation rules and generates alerts/warnings
"""

from enum import Enum
from typing import List, Dict, Tuple, Optional
from datetime import datetime

class AlertLevel(Enum):
    """Alert severity levels"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    SUCCESS = "success"

class ValidationAlert:
    """Represents a single validation alert/warning"""
    
    def __init__(self, code: str, message: str, level: AlertLevel, 
                 entity_type: str, entity_id: Optional[str] = None,
                 suggestion: Optional[str] = None):
        self.code = code
        self.message = message
        self.level = level
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.suggestion = suggestion
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            "code": self.code,
            "message": self.message,
            "level": self.level.value,
            "entityType": self.entity_type,
            "entityId": self.entity_id,
            "suggestion": self.suggestion,
            "timestamp": self.timestamp
        }

class ValidationEngine:
    """Main validation engine for roster system"""
    
    def __init__(self):
        self.alerts: List[ValidationAlert] = []
        self.rules = {
            "pilot_composition": self._validate_pilot_composition,
            "cabin_composition": self._validate_cabin_composition,
            "passenger_age": self._validate_passenger_age,
            "seat_assignment": self._validate_seat_assignment,
            "special_needs": self._validate_special_needs,
            "crew_languages": self._validate_crew_languages,
            "duplicate_passenger": self._validate_duplicate_passenger,
            "aircraft_capacity": self._validate_aircraft_capacity,
        }
    
    def clear_alerts(self):
        """Clear all alerts"""
        self.alerts = []
    
    def add_alert(self, alert: ValidationAlert):
        """Add a validation alert"""
        self.alerts.append(alert)
    
    def validate_passenger_data(self, passenger: Dict) -> List[ValidationAlert]:
        """Validate individual passenger data"""
        local_alerts = []
        
        # PAX ID validation
        if not passenger.get("paxId") or not str(passenger["paxId"]).strip():
            local_alerts.append(ValidationAlert(
                code="PAX-001",
                message="Yolcu ID boş olamaz",
                level=AlertLevel.ERROR,
                entity_type="passenger",
                entity_id=passenger.get("paxId")
            ))
        
        # Full name validation
        if not passenger.get("fullName") or not str(passenger["fullName"]).strip():
            local_alerts.append(ValidationAlert(
                code="PAX-002",
                message="Yolcu adı boş olamaz",
                level=AlertLevel.ERROR,
                entity_type="passenger",
                entity_id=passenger.get("paxId")
            ))
        
        # Age validation
        age = passenger.get("age")
        if age is None:
            local_alerts.append(ValidationAlert(
                code="PAX-003",
                message="Yaş bilgisi eksik",
                level=AlertLevel.ERROR,
                entity_type="passenger",
                entity_id=passenger.get("paxId")
            ))
        elif not isinstance(age, (int, str)):
            local_alerts.append(ValidationAlert(
                code="PAX-004",
                message="Yaş sayı olmalıdır",
                level=AlertLevel.ERROR,
                entity_type="passenger",
                entity_id=passenger.get("paxId")
            ))
        else:
            try:
                age_val = int(age)
                if age_val < 0:
                    local_alerts.append(ValidationAlert(
                        code="PAX-005",
                        message="Yaş negatif olamaz",
                        level=AlertLevel.ERROR,
                        entity_type="passenger",
                        entity_id=passenger.get("paxId")
                    ))
                elif age_val > 150:
                    local_alerts.append(ValidationAlert(
                        code="PAX-006",
                        message="Yaş değeri gerçekçi değil",
                        level=AlertLevel.WARNING,
                        entity_type="passenger",
                        entity_id=passenger.get("paxId"),
                        suggestion=f"Yaş değeri ({age_val}) kontrol edilmeli"
                    ))
            except ValueError:
                local_alerts.append(ValidationAlert(
                    code="PAX-007",
                    message="Yaş geçerli bir sayı değil",
                    level=AlertLevel.ERROR,
                    entity_type="passenger",
                    entity_id=passenger.get("paxId")
                ))
        
        # Passenger type validation
        valid_types = ["adult", "child", "infant"]
        if not passenger.get("type") or passenger["type"].lower() not in valid_types:
            local_alerts.append(ValidationAlert(
                code="PAX-008",
                message=f"Yolcu tipi geçersiz. Geçerli tipler: {', '.join(valid_types)}",
                level=AlertLevel.ERROR,
                entity_type="passenger",
                entity_id=passenger.get("paxId")
            ))
        
        return local_alerts
    
    def validate_crew_data(self, crew: Dict) -> List[ValidationAlert]:
        """Validate crew member data"""
        local_alerts = []
        
        # Crew ID validation
        if not crew.get("crewId"):
            local_alerts.append(ValidationAlert(
                code="CREW-001",
                message="Gemi görevlisinin ID'si boş olamaz",
                level=AlertLevel.ERROR,
                entity_type="crew",
                entity_id=crew.get("crewId")
            ))
        
        # Name validation
        if not crew.get("firstName") or not crew.get("lastName"):
            local_alerts.append(ValidationAlert(
                code="CREW-002",
                message="Gemi görevlisinin adı ve soyadı gerekli",
                level=AlertLevel.ERROR,
                entity_type="crew",
                entity_id=crew.get("crewId")
            ))
        
        # Role validation
        if not crew.get("role"):
            local_alerts.append(ValidationAlert(
                code="CREW-003",
                message="Gemi görevlisinin rolü belirtilmeli",
                level=AlertLevel.ERROR,
                entity_type="crew",
                entity_id=crew.get("crewId")
            ))
        
        # Language validation for cabin crew
        if crew.get("role", "").lower() in ["cabin", "attendant"]:
            if not crew.get("languages"):
                local_alerts.append(ValidationAlert(
                    code="CREW-004",
                    message="Kabin görevlisinin en az bir dil bilemesi gerekir",
                    level=AlertLevel.WARNING,
                    entity_type="crew",
                    entity_id=crew.get("crewId"),
                    suggestion="Kabin görevlisinin dil bilgisini ekleyin"
                ))
        
        return local_alerts
    
    def _validate_pilot_composition(self, roster: Dict) -> List[ValidationAlert]:
        """DR-01: Validate pilot composition requirements"""
        local_alerts = []
        pilots = roster.get("pilots", [])
        
        if len(pilots) < 2:
            local_alerts.append(ValidationAlert(
                code="DR-01",
                message="En az 2 pilot gerekli",
                level=AlertLevel.ERROR,
                entity_type="roster",
                suggestion="En az 1 senior ve 1 junior pilot ekleyin"
            ))
        
        # Check for senior pilots
        senior_count = sum(1 for p in pilots if p.get("rank", "").lower() == "senior")
        if senior_count < 1:
            local_alerts.append(ValidationAlert(
                code="DR-01-SENIOR",
                message="En az 1 senior pilot gerekli",
                level=AlertLevel.ERROR,
                entity_type="roster",
                suggestion="Senior pilot ekleyin"
            ))
        
        return local_alerts
    
    def _validate_cabin_composition(self, roster: Dict) -> List[ValidationAlert]:
        """DR-03: Validate cabin crew composition"""
        local_alerts = []
        cabin_crew = roster.get("cabinCrew", [])
        passenger_count = len(roster.get("passengers", []))
        
        # Typical requirement: 1 cabin crew per 50 passengers
        min_cabin_crew = max(1, passenger_count // 50)
        
        if len(cabin_crew) < min_cabin_crew:
            local_alerts.append(ValidationAlert(
                code="DR-03",
                message=f"Kabin görevlisi sayısı yetersiz ({len(cabin_crew)}/{min_cabin_crew})",
                level=AlertLevel.WARNING,
                entity_type="roster",
                suggestion=f"En az {min_cabin_crew} kabin görevlisi ekleyin"
            ))
        
        return local_alerts
    
    def _validate_passenger_age(self, roster: Dict) -> List[ValidationAlert]:
        """Validate passenger age constraints"""
        local_alerts = []
        passengers = roster.get("passengers", [])
        
        infants = [p for p in passengers if p.get("type", "").lower() == "infant"]
        
        # Check if infants have adult guardians
        for infant in infants:
            has_guardian = any(
                p.get("type", "").lower() == "adult" and 
                p.get("affiliateGroup") and 
                infant.get("paxId") in p.get("affiliateGroup", [])
                for p in passengers
            )
            if not has_guardian:
                local_alerts.append(ValidationAlert(
                    code="PAX-INFANT-001",
                    message=f"Bebek {infant.get('paxId')} için ebeveyn/sorumlu yok",
                    level=AlertLevel.ERROR,
                    entity_type="passenger",
                    entity_id=infant.get("paxId"),
                    suggestion="Bebeyi bir yetişkine bağlayın"
                ))
        
        return local_alerts
    
    def _validate_seat_assignment(self, roster: Dict) -> List[ValidationAlert]:
        """Validate seat assignments"""
        local_alerts = []
        passengers = roster.get("passengers", [])
        
        # Check for empty seats
        unassigned = [p for p in passengers if not p.get("seat")]
        if unassigned:
            local_alerts.append(ValidationAlert(
                code="SEAT-001",
                message=f"{len(unassigned)} yolcunun koltuk ataması yapılmamış",
                level=AlertLevel.WARNING,
                entity_type="roster",
                suggestion="Tüm yolculara koltuk atayın"
            ))
        
        # Check for duplicate seats
        seats = [p.get("seat") for p in passengers if p.get("seat")]
        duplicates = [seat for seat in seats if seats.count(seat) > 1]
        if duplicates:
            local_alerts.append(ValidationAlert(
                code="SEAT-002",
                message=f"Aynı koltuk birden fazla yolcuya atanmış: {set(duplicates)}",
                level=AlertLevel.ERROR,
                entity_type="roster"
            ))
        
        return local_alerts
    
    def _validate_special_needs(self, roster: Dict) -> List[ValidationAlert]:
        """Validate special needs handling"""
        local_alerts = []
        passengers = roster.get("passengers", [])
        
        for passenger in passengers:
            special_needs = passenger.get("specialNeeds", [])
            if isinstance(special_needs, str):
                special_needs = [special_needs] if special_needs else []
            
            if "wheelchair" in special_needs and not passenger.get("accessibleSeat"):
                local_alerts.append(ValidationAlert(
                    code="SPECIAL-001",
                    message=f"Tekerlekli sandalye kullanan {passenger.get('paxId')} erişilebilir koltuk atanmamış",
                    level=AlertLevel.WARNING,
                    entity_type="passenger",
                    entity_id=passenger.get("paxId")
                ))
        
        return local_alerts
    
    def _validate_crew_languages(self, roster: Dict) -> List[ValidationAlert]:
        """Validate crew language requirements"""
        local_alerts = []
        cabin_crew = roster.get("cabinCrew", [])
        required_languages = roster.get("requiredLanguages", ["English"])
        
        for crew in cabin_crew:
            languages = crew.get("languages", [])
            if isinstance(languages, str):
                languages = [lang.strip() for lang in languages.split(",")]
            
            missing_langs = [lang for lang in required_languages if lang not in languages]
            if missing_langs:
                local_alerts.append(ValidationAlert(
                    code="CREW-LANG-001",
                    message=f"{crew.get('firstName')} {crew.get('lastName')} dil eksikliği: {', '.join(missing_langs)}",
                    level=AlertLevel.WARNING,
                    entity_type="crew",
                    entity_id=crew.get("crewId"),
                    suggestion=f"Bu görevliler şu dilleri bilmelidir: {', '.join(required_languages)}"
                ))
        
        return local_alerts
    
    def _validate_duplicate_passenger(self, roster: Dict) -> List[ValidationAlert]:
        """Check for duplicate passengers"""
        local_alerts = []
        passengers = roster.get("passengers", [])
        pax_ids = [p.get("paxId") for p in passengers]
        
        duplicates = [pax_id for pax_id in set(pax_ids) if pax_ids.count(pax_id) > 1]
        for dup_id in duplicates:
            local_alerts.append(ValidationAlert(
                code="PAX-DUP-001",
                message=f"Yolcu {dup_id} birden fazla kez eklenmişş",
                level=AlertLevel.ERROR,
                entity_type="passenger",
                entity_id=dup_id
            ))
        
        return local_alerts
    
    def _validate_aircraft_capacity(self, roster: Dict) -> List[ValidationAlert]:
        """Validate aircraft capacity"""
        local_alerts = []
        passengers = roster.get("passengers", [])
        cabin_crew = roster.get("cabinCrew", [])
        flight_crew = roster.get("pilots", [])
        
        aircraft_type = roster.get("aircraft", {}).get("type", "")
        
        # Standard capacity values
        capacity_map = {
            "boeing747": 416,
            "boeing777": 396,
            "airbus380": 555,
            "airbus350": 325,
            "boeing787": 280,
        }
        
        max_capacity = capacity_map.get(aircraft_type.lower(), 200)
        total_personnel = len(passengers) + len(cabin_crew) + len(flight_crew)
        
        if total_personnel > max_capacity:
            local_alerts.append(ValidationAlert(
                code="CAPACITY-001",
                message=f"Uçak kapasitesi aşılmış ({total_personnel}/{max_capacity})",
                level=AlertLevel.ERROR,
                entity_type="roster",
                suggestion=f"Maksimum {max_capacity} kişi olabilir"
            ))
        
        return local_alerts
    
    def validate_roster(self, roster: Dict) -> Dict:
        """
        Main validation function for a complete roster
        Returns a dict with alerts, summary, and status
        """
        self.clear_alerts()
        
        # Validate all passengers
        for passenger in roster.get("passengers", []):
            self.alerts.extend(self.validate_passenger_data(passenger))
        
        # Validate all crew members
        for crew in roster.get("cabinCrew", []):
            self.alerts.extend(self.validate_crew_data(crew))
        
        for pilot in roster.get("pilots", []):
            self.alerts.extend(self.validate_crew_data(pilot))
        
        # Run rule-based validations
        for rule_func in self.rules.values():
            self.alerts.extend(rule_func(roster))
        
        # Calculate summary
        error_count = sum(1 for a in self.alerts if a.level == AlertLevel.ERROR)
        warning_count = sum(1 for a in self.alerts if a.level == AlertLevel.WARNING)
        info_count = sum(1 for a in self.alerts if a.level == AlertLevel.INFO)
        
        is_valid = error_count == 0
        
        return {
            "isValid": is_valid,
            "summary": {
                "totalAlerts": len(self.alerts),
                "errors": error_count,
                "warnings": warning_count,
                "info": info_count
            },
            "alerts": [alert.to_dict() for alert in self.alerts],
            "timestamp": datetime.now().isoformat()
        }

# Utility function for email validation
def validate_email(email: str) -> bool:
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# Utility function for phone validation
def validate_phone(phone: str) -> bool:
    """Basic phone validation (international format)"""
    import re
    pattern = r'^\+?1?\d{9,15}$'
    return re.match(pattern, phone) is not None

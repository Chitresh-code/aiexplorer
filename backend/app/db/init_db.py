import logging
from app.db.session import SessionLocal
from app.models.domain import StatusMapping, BusinessUnitMapping, AIThemeMapping, PersonaMapping, VendorModelMapping, RoleMapping

logger = logging.getLogger(__name__)

def setup_initial_data():
    """Import lookup data if not already present"""
    db = SessionLocal()
    try:
        # Check if lookup tables have data
        ai_themes_count = db.query(AIThemeMapping).count()
        personas_count = db.query(PersonaMapping).count()
        vendors_count = db.query(VendorModelMapping).count()
        business_units_count = db.query(BusinessUnitMapping).count()
        roles_count = db.query(RoleMapping).count()

        if ai_themes_count == 0 or personas_count == 0 or vendors_count == 0 or business_units_count == 0 or roles_count == 0:
            logger.info("[INFO] Importing lookup table data...")
            # We can't easily call the old scripts if they depend on old structure
            # For now, we assume the user will run scripts manually or we refactor them
            # To keep functionality, I'll try to import the logic from the script
            try:
                from scripts.import_lookups import import_lookup_tables
                import_lookup_tables()
                logger.info("[OK] Lookup data imported successfully")
            except ImportError:
                logger.warning("[WARNING] Could not find import_lookups in scripts. Check PYTHONPATH.")
        else:
            logger.info("[OK] Lookup data already present")
    except Exception as e:
        logger.error(f"[ERROR] Error checking/importing lookup data: {e}")
    finally:
        db.close()

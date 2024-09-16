from urllib.parse import urlparse

from settings import DATABASE_URI

IS_RELATIONAL_DB = False

DATABASE_TYPE, _, _ = urlparse(DATABASE_URI).scheme.partition('+')
if DATABASE_TYPE == 'mysql':
    from .mysql import AsyncMySQLEngine as AsyncRelationalDBEngine
    from .mysql import AsyncMySQLScopedSession as AsyncScopedSession
    from .mysql import get_async_mysql_session as get_async_session
    from .mysql import initialize_mysql_db as initialize_db

    IS_RELATIONAL_DB = True
    
else:
    raise RuntimeError(
        f'Invalid database type \'{DATABASE_TYPE}\' provided in DATABASE_URI: {DATABASE_URI}'
    )
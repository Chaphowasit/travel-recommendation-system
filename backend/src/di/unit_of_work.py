import abc
from abc import abstractmethod
from typing import Any, Generic, Optional, Type, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

from repositories.abstraction import AbstractPlaceRepository
from repositories.relational_db import RelationalDBPlaceRepository

# pylint: disable=import-outside-toplevel,attribute-defined-outside-init


T = TypeVar('T', bound=AbstractPlaceRepository)


class AbstractUnitOfWork(Generic[T], abc.ABC):
    place_repo: AbstractPlaceRepository

    def __init__(self, place_repo: T):
        self.place_repo = place_repo

    @abstractmethod
    async def __aenter__(self) -> 'AbstractUnitOfWork[T]':
        raise NotImplementedError

    @abstractmethod
    async def __aexit__(self, exc_type, exc, tb):
        raise NotImplementedError


class AsyncSQLAlchemyUnitOfWork(AbstractUnitOfWork[RelationalDBPlaceRepository]):
    def __init__(self, session: AsyncSession, place_repo: RelationalDBPlaceRepository):
        super().__init__(place_repo)
        self._session = session

    async def __aenter__(self):
        return self

    async def __aexit__(
        self, exc_type: Optional[Type[BaseException]], exc: Optional[BaseException], tb: Any
    ):
        try:
            if exc_type is None:
                await self._session.commit()
            else:
                await self._session.rollback()
        finally:
            await self._session.close()
            await self.remove()

    async def remove(self):
        from settings.db import AsyncScopedSession

        # https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html#sqlalchemy.ext.asyncio.async_scoped_session.remove
        await AsyncScopedSession.remove()
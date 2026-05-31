from abc import ABC, abstractmethod

class BaseSQLModel(ABC):
    @abstractmethod
    def generate_sql(self, query: str, schema: str) -> str:
        """
        Translates a native Bengali query command into structured clean SQL.
        
        Args:
            query (str): The raw Bengali command/phrase.
            schema (str): Standardized description of the target schema catalogs/tables.
            
        Returns:
            str: Output of the clean synthesized SQL statement.
        """
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """Friendly model representation identifier."""
        pass

    @property
    @abstractmethod
    def provider(self) -> str:
        """Model supplier provider name."""
        pass

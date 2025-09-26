from typing import Dict, List, Optional
from datetime import datetime
from bson import ObjectId
import asyncio

class MockDatabase:
    def __init__(self):
        self.users = {}
        self.symptoms = {}
        self.medications = {}
        self.visits = {}
        self.family_members = {}
        self.photos = {}
    
    async def find_one(self, query: Dict) -> Optional[Dict]:
        """Mock find_one operation"""
        if "email" in query:
            email = query["email"]
            for user_id, user in self.users.items():
                if user.get("email") == email:
                    return user
        return None
    
    async def insert_one(self, document: Dict) -> "MockInsertResult":
        """Mock insert_one operation"""
        doc_id = ObjectId()
        document["_id"] = doc_id
        self.users[str(doc_id)] = document
        return MockInsertResult(doc_id)
    
    async def find(self, query: Dict = None) -> "MockCursor":
        """Mock find operation"""
        return MockCursor(list(self.users.values()))

class MockInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class MockCursor:
    def __init__(self, documents: List[Dict]):
        self.documents = documents
    
    def to_list(self, length: Optional[int] = None) -> List[Dict]:
        if length is None:
            return self.documents
        return self.documents[:length]

class MockCollection:
    def __init__(self):
        self.db = MockDatabase()
    
    async def find_one(self, query: Dict) -> Optional[Dict]:
        return await self.db.find_one(query)
    
    async def insert_one(self, document: Dict) -> MockInsertResult:
        return await self.db.insert_one(document)
    
    async def find(self, query: Dict = None) -> MockCursor:
        return await self.db.find(query)

class MockMongoDatabase:
    def __init__(self):
        self.users = MockCollection()
        self.symptoms = MockCollection()
        self.medications = MockCollection()
        self.visits = MockCollection()
        self.family_members = MockCollection()
        self.photos = MockCollection()

# Global mock database instance
mock_db = MockMongoDatabase()

def get_mock_database():
    return mock_db
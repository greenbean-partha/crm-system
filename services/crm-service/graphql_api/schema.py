import strawberry

@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> str:
        return "crm ok"

schema = strawberry.Schema(query=Query)

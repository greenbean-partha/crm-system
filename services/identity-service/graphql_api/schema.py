import strawberry

@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> str:
        return "identity ok"

schema = strawberry.Schema(query=Query)

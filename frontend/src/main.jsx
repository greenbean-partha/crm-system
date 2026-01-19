import React from "react";
import ReactDOM from "react-dom/client";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import App from "./App";

function Root() {
  const companyId = localStorage.getItem("companyId") || "";

  const client = new ApolloClient({
    link: new HttpLink({
      uri: "/graphql",
      headers: companyId ? { "x-company-id": companyId } : {},
    }),
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client} key={companyId}>
      <App />
    </ApolloProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);

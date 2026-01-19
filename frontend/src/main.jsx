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
  const client = new ApolloClient({
  link: new HttpLink({
    uri: "/graphql",
  }),
  cache: new InMemoryCache(),
});

  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);

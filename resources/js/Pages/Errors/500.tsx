import React from "react";
import ErrorPage from "../../Components/ErrorPage";

export default function Error500() {
  return <ErrorPage status={500} />;
}

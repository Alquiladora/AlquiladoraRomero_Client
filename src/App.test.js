
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";


jest.mock("./routers/Routers", () => () => (
  <div data-testid="mock-routers">App Renderizado</div>
));

test("renders app without crashing", () => {
  render(<App />);
  expect(screen.getByTestId("mock-routers")).toBeInTheDocument();
});
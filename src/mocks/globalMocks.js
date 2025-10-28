
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("../../../utils/AxiosConfig", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock("../../../hooks/ContextAuth", () => ({
  useAuth: jest.fn(),
}));


jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: (props) => {
    return <i data-testid="fa-icon" className={`fa-${props.icon.iconName}`} />;
  },
}));
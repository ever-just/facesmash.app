
import { Link } from "react-router-dom";

const LoginFooter = () => {
  return (
    <div className="mt-8 text-center">
      <p className="text-gray-400 text-sm">
        Don't have a Face Card yet?{" "}
        <Link 
          to="/register" 
          className="text-white hover:text-gray-300 underline"
        >
          Create one now
        </Link>
      </p>
    </div>
  );
};

export default LoginFooter;

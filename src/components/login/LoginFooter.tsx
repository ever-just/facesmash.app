
import { Link } from "react-router-dom";

const LoginFooter = () => {
  return (
    <div className="mt-8 text-center">
      <p className="text-gray-400 mb-4">Need help?</p>
      <div className="flex justify-center space-x-4">
        <Link to="/register">
          <button className="text-white hover:text-gray-300 hover:bg-gray-900 px-4 py-2 rounded">
            Don't have a Face Card?
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LoginFooter;

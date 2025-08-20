import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import TaskMateLoading from "../Pages/Loading/TaskMateLoading";

export default function ProtectedRoute({ children }) {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) return <TaskMateLoading />;

    return isSignedIn ? children : <Navigate to="/sign-in" />;
}

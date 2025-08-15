import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) return <p>Loading...</p>;

    return isSignedIn ? children : <Navigate to="/sign-in" />;
}

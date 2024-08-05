import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/RegisterPage";
import CheckEmailPage from "../pages/CheckEmailPage";
import CheckPasswordPage from "../pages/CheckPasswordPage";
import Home from "../pages/Home";
import Message from "../components/Message";
import AuthLayouts from "../layout";

const router = createBrowserRouter([
{
    path : "/",
    element : <App/>,
    children : [
        {
            path : "register",
            element : <AuthLayouts><RegisterPage/></AuthLayouts> 
        },
        {
            path : 'email',
            element : <CheckEmailPage/>
        },
        {
            path : 'password',
            element : <CheckPasswordPage/>
        },
        {
            path : "",
            element : <Home/>,
            children : [
                {
                    path : ':userId',
                    element : <Message/>
                }
            ]
        }
    ]
}
])

export default router
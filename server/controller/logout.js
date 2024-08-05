async function logout(request,response){
    try{

        const cookieOptions = {
            http: true,
            secure: true
        }

        return response.cookie('token','',cookieOptions).status(200).json({
            message: "Session out",
            success: true
        })
    }
    catch(error){
        response.status(500).json({
            message: error.message || error,
            error: true
        })
    }
}

module.exports = logout
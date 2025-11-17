
//Ensures the user is logged in before accessing certain routes.
export function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Not logged in"});
    }
    next();
    }


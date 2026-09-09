// Authorization middleware protects routes by checking whether the user is logged in
// and whether they have the required role before allowing the request to continue.

export function requireLogin(req, res, next) {

    // User must have an active session
    if (!req.session.userId) {
        return res.status(401).json({
            message: "You must be logged in"
        });
    }

    next();
}


export function requireAdmin(req, res, next) {

    // User must be logged in first
    if (!req.session.userId) {
        return res.status(401).json({
            message: "You must be logged in"
        });
    }

    // Only admins are allowed to continue
    if (req.session.role !== "admin") {
        return res.status(403).json({
            message: "Admin access only"
        });
    }

    next(); //the middleware check passed, so continue to the actual route.
}
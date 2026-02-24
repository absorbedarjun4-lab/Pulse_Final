/**
 * roleGuard - Factory that returns middleware restricting access by role.
 * Usage: router.get('/admin-only', auth, roleGuard('admin'), handler)
 *
 * @param {...string} allowedRoles - One or more allowed roles
 */
const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access forbidden. You do not have the required permissions.',
            });
        }

        next();
    };
};

module.exports = roleGuard;

export default {
  install (Vue, options) {
    this.check()
  },

  check (user, to) {
    if (!to.meta.auth) return true

    // Always give system admin access
    if (user.systemAdmin) return true

    // Role on org is required
    if (!user || !user.role) return false

    // Check if org role is high enough
    if (to.meta.minimumOrgRole === 'admin') return user.role === 'admin'
    if (to.meta.minimumOrgRole === 'staff') return ['admin', 'staff'].includes(user.role)
    if (to.meta.minimumOrgRole === 'student') return ['admin', 'staff', 'student'].includes(user.role)
    return true
  }
}

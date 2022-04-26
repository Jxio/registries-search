import { nextTick } from 'vue'
import { RouteLocationNormalized } from 'vue-router'
// External
import { createRouter, createWebHistory } from 'vue-router'
// BC registry
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
// Local
import { RouteNames } from '@/enums'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(sessionStorage.getItem('VUE_ROUTER_BASE') || ''),
  routes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    // see https://router.vuejs.org/guide/advanced/scroll-behavior.html
    return { top: 0 }
  },
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.beforeEach((to, from, next) => {
  if (isLoginSuccess(to)) {
    // this route is to verify login
    next({
      name: RouteNames.SIGN_IN,
      query: { redirect: to.query.redirect },
    })
  } else {
    if (requiresAuth(to) && !isAuthenticated()) {
      // this route needs authentication, so re-route to login
      next({
        name: RouteNames.LOGIN,
        query: { redirect: to.fullPath },
      })
    } else {
      if (isLogin(to) && isAuthenticated()) {
        // this route is to login
        next({ name: RouteNames.DASHBOARD })
      } else {
        // otherwise just proceed normally
        next()
      }
    }
  }
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.afterEach((to, from) => {
  // Overrid the browser tab name
  nextTick(() => {
    if (to.meta.title) {
      document.title = to.meta.title as string
    }
  })
})

/** Returns True if route requires authentication, else False. */
function requiresAuth(route: RouteLocationNormalized): boolean {
  return route.matched.some(r => r.meta?.requiresAuth)
}

/** Returns True if user is authenticated, else False. */
function isAuthenticated(): boolean {
  // FUTURE: also check that token isn't expired!
  return Boolean(sessionStorage.getItem(SessionStorageKeys.KeyCloakToken))
}

/** Returns True if route is Signin, else False. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isSigninRoute(route: RouteLocationNormalized): boolean {
  return Boolean(route.name === RouteNames.SIGN_IN)
}

/** Returns True if route is Signout, else False. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isSignoutRoute(route: RouteLocationNormalized): boolean {
  return Boolean(route.name === RouteNames.SIGN_OUT)
}

/** Returns True if route is Login success, else False. */
function isLogin(route: RouteLocationNormalized): boolean {
  return Boolean(route.name === RouteNames.LOGIN)
}

/** Returns True if route is Login success, else False. */
function isLoginSuccess(route: RouteLocationNormalized): boolean {
  return Boolean(route.name === RouteNames.LOGIN && route.hash)
}

export { router }
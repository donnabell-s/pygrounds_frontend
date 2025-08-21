export const PATHS = {
    ADMIN_MAIN: {
        path: "admin/:adminId",
        label: "Admin Main"
    },
    USER_MAIN: {
        path: "/:userId",
        label: "User Main"
    },
    LANDING: {
        path: "/landing",
        label: "Landing"
    },
    LOGIN: {
        path: "/login",
        label: "Login"
    },
    ADMIN_LOGIN: {
        path: "/admin-login",
        label: "Admin Login"
    },
    REGISTER: {
        path: "/register",
        USER_INFO: {
            path: "user-information",
            label: "User Information"
        },
        PRE_TEST: {
            path: "pre-test-assessment",
            label: "Pre-Test Assessment"
        },
        TERMS_AND_CONDITIONS: {
            path: "terms-and-conditions",
            label: "Terms and Conditions"
        }
    },
    USER_VIEW: {
        HOME: {
            path: "home",
            label: "Home"
        },
        MY_PROFILE: {
            path: "my-profile",
            label: "My Profile"
        },
        PYTHON_LEARN: {
            path: "python-learn",
            label: "Python Learn"
        },
        LEADERBOARD: {
            path: "leaderboard",
            label: "Leaderboard"
        }
    },
    ADMIN_VIEW: {
        ADMIN_VIEWS: {
            DASHBOARD: {
            path: "dashboard",
            label: "Dashboard"
            },
            NOTIFICATIONS: {
            path: "notifications",
            label: "Notifications"
            }
        },
        TOPIC_MANAGEMENT: {
            ZONE: {
                path: "zones",
                label: "View Zones"
            },
            TOPIC: {
                path: "topics",
                label: "View Topics"

            },
            SUBTOPIC: {
                path: "subtopics",
                label: "View Subtopics"
            }
        },
        QUESTION_MANAGEMENT: {
            VIEW_QUESTIONS: {
                path: "questions/view",
                label: "Question Bank"
            }
        },
        CONTENT_UPLOAD: {
            path: "content-upload",
            label: "Uploaded Files"
        },
        USER_MANAGEMENT: {
            VIEW_USERS: {
            path: "users/view/:userId",
            label: "View Users"
            }
        }
    },
    GAME_VIEW: {
        GAME_PREVIEW: {
            path: ":game/preview",
            label: "Game Preview"
        },
        GAME_START: {
            path: ":game/start",
            label: "Game Start"
        }
    }


}
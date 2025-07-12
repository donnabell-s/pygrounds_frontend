export const PATHS = {
    USER_MAIN: {
        path: "/user",
        label: "User Main"
    },
    LOGIN: {
        path: "/login",
        label: "Login"
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
        MY_SKILLS: {
            path: "my-skills",
            label: "My Skills"
        },
        LEADERBOARD: {
            path: "leaderboard",
            label: "Leaderboard"
        }
    },
    GAME_VIEW(gameName: string) {
        return {
            GAME_Preview: {
            path: `/user/${gameName}/preview`,
            label: "Game Preview"
            },
            GAME_START: {
            path: `/user/${gameName}/start`,
            label: "Game Start"
            }
        };
    }

}
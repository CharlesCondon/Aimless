import "react-native-gesture-handler";
import { Redirect, Stack, usePathname } from "expo-router";
import { UserContext } from "@/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { useSession } from "../../context/AuthContext";
import LoadingScreen from "@/components/Loading/Loading";
import Purchases from "react-native-purchases";
import { supabase } from "@/lib/supabase";
import AppStartupManager from "@/lib/AppStartupManager";

export default function RootLayout() {
    const { session, isLoading } = useSession();
    const [user, setUser] = useState<User | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const [userNotFound, setUserNotFound] = useState<boolean>(false);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.id) {
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (error) {
                console.log("Error fetching user data:", error);
                setUserNotFound(true);
            } else {
                console.log("root layout: user set");
                setUser(data);
            }

            setLoading(false);
        };

        fetchUserData();
    }, [session?.user?.id]);

    if (!session) {
        return <Redirect href="/sign-in" />;
    }

    if (userNotFound && pathname !== "/create-profile") {
        return <Redirect href="/create-profile" />;
    }

    useEffect(() => {
        AppStartupManager.init().catch(console.error);
    }, []);

    useEffect(() => {
        AppStartupManager.runWhenReady(() => {
            try {
                Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);
                Purchases.configure({
                    apiKey: process.env.EXPO_PUBLIC_REVCAT_KEY || "",
                    appUserID: null,
                    useAmazon: false,
                });
                console.log("purchases configure success");
            } catch (error) {
                console.log("RevenueCat initialization error:", error);
            }
        });
    }, []);

    if (isLoading || loading) {
        return <LoadingScreen />;
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            <Stack
                screenOptions={{
                    contentStyle: { backgroundColor: "rgb(18, 18, 18)" },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="create-profile"
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
            </Stack>
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

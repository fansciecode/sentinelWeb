import { UserProfile } from '@iov/keycontrol';
import { db } from "./Store";

export const Profile = async (password: string) => {
    const profile = await UserProfile.loadFrom(db, password);
    return {
        Profile: profile
    }
}
import { UserProfile } from '@iov/keycontrol';
import {db} from "./Store";
export const LoginWithPrivKey = async(password:string) => {
const loaded = await UserProfile.loadFrom(db, password);
    return loaded ;
}
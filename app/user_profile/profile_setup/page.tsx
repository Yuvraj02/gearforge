import { Suspense } from "react"
import ProfileSetup from "./ProfileSetup"

function ProfileSetupPage() {
    
    //This is a wrapper function needed for build
    
    return (<Suspense>

        <ProfileSetup />

    </Suspense>)

}

export default ProfileSetupPage
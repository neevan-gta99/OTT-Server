import userDTO from "../schemas/userSchema.js";


const updateAccessibleIds = async () => {

    try {
        const updatedUser = await userDTO.findOneAndUpdate(
            { userName: userName },
            { $addToSet: { accessibleVideosIds: videoId } },
            { new: true }
        );

        if (updatedUser) {
            console.log("User updated:", updatedUser);
        } else {
            console.log("User not found");
        }
    }
    catch (err) {
        throw new Error("DB write Failed", err)
    }



}


const DB_writes = { updateAccessibleIds };
export default DB_writes;
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { uploadFileToS3 } = require("../../service/common/s3.service");
const { getblock } = require("../../service/repository/Block.service");
const { getComment } = require("../../service/repository/Comment.service");
const { isFollow } = require("../../service/repository/Follow.service");
const { getHashTags, createHashtag, updateHashtag, extractHashtags } = require("../../service/repository/hashtag.service");
const { getLike } = require("../../service/repository/Like.service");
const { createMedia } = require("../../service/repository/Media.service");
const { updateMusic, getMusic } = require("../../service/repository/Music.service");
const { deleteNotification } = require("../../service/repository/notification.service");
const { getSave } = require("../../service/repository/Save.service");
const { createSocial, getSocial, deleteSocial, updateSocial, getFollowerSocials } = require("../../service/repository/SocialMedia.service");
const { getUser, updateUser } = require("../../service/repository/user.service");
const { Op, Sequelize } = require('sequelize');

async function uploadSocial(req, res) {
    try {
        const social_type = req.body.social_type
        const user_id = req.authData.user_id

        let allowedUpdateFieldsMandatory = [];
        let allowedUpdateFields = [];
        let post_media
        if (process.env.MEDIAFLOW == "S3") {
            if (!req.body.file_media_1) {
                return generalResponse(
                    res,
                    {},
                    "File Data is missing",
                    false,
                    true,
                    404
                );
            }

            post_media = req.body.file_media_1
        }
        else {

            post_media = req.files[0].path
        }
        let media_location
        if (social_type == "reel") {
            if (process.env.MEDIAFLOW == "S3") {
                if (!req.body.file_media_2) {
                    return generalResponse(
                        res,
                        {},
                        "File Data is missing",
                        false,
                        true,
                        404
                    );
                }

                media_location = req.body.file_media_2
            }
            else {
                media_location = req.files[1].path

            }
        }
        allowedUpdateFieldsMandatory = ['social_desc', 'social_type', 'location', 'taged', 'files', 'aspect_ratio', 'video_hight', 'music_id']
        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFieldsMandatory);
            filteredData.user_id = user_id
        }
        catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                "Data is Missing",
                false,
                true
            );
        }
        const isUser = await getUser(filteredData)

        if (!isUser) {
            // return generalResponse(
            //     res, req.files[1].path

            // )
        }
        filteredData.country = isUser.country
        if (filteredData.social_desc) {
            filteredData.hashtag = extractHashtags(filteredData.social_desc);
        }
        if (filteredData?.hashtag || filteredData?.hashtag?.length > 0) {
            filteredData.hashtag.forEach(async (hashtag) => {
                const isHashtag = await getHashTags({ hashtag_name: hashtag })

                if (isHashtag.Records.length <= 0) {
                    await createHashtag({ hashtag_name: hashtag, counts: 1 })
                }
                else {

                    await updateHashtag({ counts: isHashtag.Records[0].counts + 1 }, { hashtag_name: isHashtag.Records[0].hashtag_name })
                }
            })
        }


        if (social_type == 'post') {

            const post = await createSocial(
                filteredData
            )
            if (post) {
                const mediaPromises = req.files.map((file) => {
                    const mediaData = {
                        social_id: post.social_id,
                        media_location: file.path, // Assuming `file.path` contains the uploaded file's location
                    };

                    // Call createMedia function for each file
                    return createMedia(mediaData);
                });

                // Wait for all media entries to be created
                const mediaResults = await Promise.all(mediaPromises);
                const updated_user = await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id: user_id })
                if (mediaResults) {
                    return generalResponse(
                        res,
                        {},
                        "Post Uploaded Successfully",
                        true,
                        true
                    )
                }
                return generalResponse(
                    res,
                    {},
                    "Failed to Upload post",
                    ture,
                    true
                )
            }
            return generalResponse(
                res,
                {},
                "Failed to Upload post",
                ture,
                true
            )
        }
        else if (social_type == 'reel') {
            filteredData.reel_thumbnail = post_media
            const reel = await createSocial(
                filteredData
            )
            if (reel) {

                const media = createMedia(
                    {
                        social_id: reel.social_id,
                        media_location: media_location
                    }
                )
                if (media) {


                    const updated_user = await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id: user_id })
                    if (reel.music_id) {
                        const get_music = await getMusic({
                            music_id: reel.music_id
                        })
                        if (get_music.Pagination.total_records > 0) {
                            const update_music = updateMusic(
                                {
                                    total_use: get_music.Records[0].total_use + 1
                                }
                            )
                        }

                    }
                    return generalResponse(
                        res,
                        {},
                        "Reel Uploaded Successfully",
                        true,
                        true
                    )
                }
                return generalResponse(
                    res,
                    {},
                    "Failed to Upload post",
                    ture,
                    true
                )
            }
            return generalResponse(
                res,
                {},
                "Failed to Upload post",
                ture,
                true
            )
        }
        return generalResponse(
            res,
            "Failed to Upload",
            false,
            true,

        );

    } catch (error) {
        console.error("Error in uploading social", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while uploading social!",
            false,
            true
        );
    }
}
async function uploadMediaS3(req, res) {
    try {
        const file = req.body
        if (!file.originalname && !file.mimetype) {
            return generalResponse(
                res,
                {},
                "File Data is missing",
                false,
                true,
                404
            );
        }
        const url = await uploadFileToS3(file);
        if (url) {
            return generalResponse(
                res,
                { url: url },
                "File Uploaded Successfully",
                true,
                true
            );
        } else {
            return generalResponse(
                res,
                {},
                "Failed to Upload File",
                false,
                true
            );
        }


    } catch (error) {
        console.error("Error in uploading file in s3", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while uploading file in s3!",
            false,
            true
        );
    }
}

async function showSocials(req, res) {
    try {
        const user_id = req.authData.user_id
        const { page = 1, pageSize = 10, order = [
            ['createdAt', 'DESC'],
        ] } = req.body

        let allowedUpdateFieldsMandatory = [];
        let allowedUpdateFields = [];

        allowedUpdateFields = ['social_id', 'social_type', 'country', 'location', 'taged', 'user_id', 'hashtag', 'music_id']
        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields);
            filteredData.status = true
            filteredData.deleted_by_user = false
        }
        catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                "Data is Missing",
                false,
                true
            );
        }
        if (await getUser({ user_id })) {
            let excludedUserIds = []
            const uniqueIds = new Set();

            const block1 = await getblock({ user_id: user_id })
            const block2 = await getblock({ blocked_id: user_id })
            if (block1?.Records?.length > 0 || block1?.Records?.length > 0) {
                block1?.Records?.forEach(blocks => {
                    uniqueIds.add(blocks?.dataValues?.blocked_id);
                });
                block2?.Records?.forEach(blocks => {
                    uniqueIds.add(blocks?.dataValues?.user_id);
                });

                excludedUserIds = Array.from(uniqueIds);

            }

            status = true
            let socials
            if (order == "random") {

                socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds, Sequelize.literal('RANDOM()'));
            }
            else {
                socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds, order);

            }

            // Filter out blocked users
            if (socials?.Records?.length <= 0) {
                return generalResponse(
                    res,
                    {
                        Records: [],
                        Pagination: {}
                    },
                    "Socials not found",
                    true,
                    true,
                    // 400
                );
            }


            // Now, you can safely iterate over the records and add the `isLiked` property
            const likes = await getLike({ like_by: user_id });
            const likedSocialIds = new Set(likes.Records.map((like) => like.social_id));
            const saves = await getSave({ save_by: user_id });
            const savedSocialIds = new Set(saves.Records.map((save) => save.social_id));

            // Add an `isLiked` property to each social record
            socials.Records = await Promise.all(socials.Records.map(async (social) => {
                // Convert each social object to a plain JSON object
                const socialJson = JSON.parse(JSON.stringify(social));

                // Fetch comments and likes asynchronously
                const comments = await getComment({ social_id: socialJson.social_id });
                const likes = await getLike({ social_id: socialJson.social_id });
                const saves = await getSave({ social_id: socialJson.social_id });
                const isFollowing = await isFollow({ follower_id: user_id, user_id: socialJson.user_id })
                // Add the isLiked, total_comments, and total_likes properties
                socialJson.isLiked = likedSocialIds.has(socialJson.social_id);
                socialJson.isSaved = savedSocialIds.has(socialJson.social_id);
                socialJson.total_comments = comments.Pagination.total_records;
                socialJson.total_likes = likes.Pagination.total_records;
                socialJson.total_saves = saves.Pagination.total_records;
                socialJson.isFollowing = false;
                if (isFollowing) {
                    socialJson.isFollowing = true;
                }
                // Add the isLiked, total_comments, and total_likes properties


                return socialJson;
            }));

            return generalResponse(
                res,
                {
                    Records: socials.Records,
                    Pagination: socials.Pagination
                },
                "Socials Found",
                true,
                false
            );
        } else {
            return generalResponse(
                res,
                {},
                "User not found",
                false,
                true,
                404
            );
        }

    } catch (error) {
        console.error("Error in finding social", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while finding social!",
            false,
            true
        );
    }
}
async function getSocialsOfFollowers(req, res) {
    try {
        const user_id = req.authData.user_id;
        const { page = 1, pageSize = 10 } = req.body;

        const result = await getFollowerSocials(user_id, { page, pageSize });

        if (!result.Records.length) {
            return generalResponse(
                res,
                { Records: [], Pagination: {} },
                "No reels found from followed users",
                true,
                true
            );
        }

        // Preload likes and saves made by current user
        const [userLikes, userSaves] = await Promise.all([
            getLike({ like_by: user_id }),
            getSave({ save_by: user_id }),
        ]);

        const likedSocialIds = new Set(userLikes?.Records?.map(like => like.social_id));
        const savedSocialIds = new Set(userSaves?.Records?.map(save => save.social_id));

        // Enrich each social with isLiked, isSaved, total_comments, total_likes, total_saves, isFollowing
        const enrichedRecords = await Promise.all(result.Records.map(async (social) => {
            const socialJson = JSON.parse(JSON.stringify(social)); // make plain object

            const [comments, likes, saves] = await Promise.all([
                getComment({ social_id: socialJson.social_id }),
                getLike({ social_id: socialJson.social_id }),
                getSave({ social_id: socialJson.social_id })
            ]);

            socialJson.isLiked = likedSocialIds.has(socialJson.social_id);
            socialJson.isSaved = savedSocialIds.has(socialJson.social_id);
            socialJson.total_comments = comments?.Pagination?.total_records || 0;
            socialJson.total_likes = likes?.Pagination?.total_records || 0;
            socialJson.total_saves = saves?.Pagination?.total_records || 0;
            socialJson.isFollowing = true; // by default, as this is from followed users

            return socialJson;
        }));

        return generalResponse(
            res,
            {
                Records: enrichedRecords,
                Pagination: result.Pagination
            },
            "Reels from followed users fetched successfully",
            true,
            false
        );

    } catch (err) {
        console.error("Error in getFollowerSocials:", err);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong",
            false,
            true
        );
    }
}


async function showSocialswithoutauth(req, res) {
    try {
        // const user_id = req.authData.user_id
        const { page = 1, pageSize = 10, order = [
            ['createdAt', 'DESC'],
        ] } = req.body

        let allowedUpdateFieldsMandatory = [];
        let allowedUpdateFields = [];

        allowedUpdateFields = ['social_id', 'social_type', 'country', 'location', 'taged', 'user_id', 'hashtag', 'music_id']
        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields);
            filteredData.status = true
            filteredData.deleted_by_user = false
        }
        catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                "Data is Missing",
                false,
                true
            );
        }
        let excludedUserIds = []

        status = true
        let socials
        if (order == "random") {

            socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds, Sequelize.literal('RANDOM()'));
        }
        else {
            socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds, order);

        }

        // Filter out blocked users
        if (socials?.Records?.length <= 0) {
            return generalResponse(
                res,
                {
                    Records: [],
                    Pagination: {}
                },
                "Socials not found",
                true,
                true,
                // 400
            );
        }


        // Now, you can safely iterate over the records and add the `isLiked` property


        // Add an `isLiked` property to each social record
        socials.Records = await Promise.all(socials.Records.map(async (social) => {
            // Convert each social object to a plain JSON object
            const socialJson = JSON.parse(JSON.stringify(social));

            // Fetch comments and likes asynchronously
            const comments = await getComment({ social_id: socialJson.social_id });
            const likes = await getLike({ social_id: socialJson.social_id });
            const saves = await getSave({ social_id: socialJson.social_id });
            // const isFollowing = await isFollow({ follower_id: user_id, user_id: socialJson.user_id })
            // Add the isLiked, total_comments, and total_likes properties

            socialJson.total_comments = comments.Pagination.total_records;
            socialJson.total_likes = likes.Pagination.total_records;
            socialJson.total_saves = saves.Pagination.total_records;
            socialJson.isFollowing = false;

            // Add the isLiked, total_comments, and total_likes properties


            return socialJson;
        }));

        return generalResponse(
            res,
            {
                Records: socials.Records,
                Pagination: socials.Pagination
            },
            "Socials Found",
            true,
            false
        );


    } catch (error) {
        console.error("Error in finding social", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while finding social!",
            false,
            true
        );
    }
}

async function showSocialsAdmin(req, res) {
    try {
        const admin_id = req.authData.admin_id
        const { page = 1, pageSize = 10 } = req.body
        const { sort_by = "createdAt", sort_order = "DESC" } = req.body
        let allowedUpdateFieldsMandatory = [];
        let allowedUpdateFields = [];
        let allowedUpdateFieldsFilter = [];

        allowedUpdateFields = ['social_id', 'social_type', 'country', 'location', 'taged', 'user_id', 'status', 'user_name']

        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields);
        }
        catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                "Data is Missing",
                false,
                true
            );
        }



        const socials = await getSocial(
            filteredData,
            { page, pageSize },
            [],
            [[sort_by, sort_order]]
        );

        // Filter out blocked users
        if (socials?.Records?.length <= 0) {
            return generalResponse(
                res,
                {
                    Records: [],
                    Pagination: {}
                },
                "Socials not found",
                true,
                true,
                // 400
            );
        }


        // Now, you can safely iterate over the records and add the `isLiked` property
        // const likes = await getLike({ like_by: user_id });
        // const likedSocialIds = new Set(likes.Records.map((like) => like.social_id));
        // const saves = await getSave({ save_by: user_id });
        // const savedSocialIds = new Set(saves.Records.map((save) => save.social_id));

        // Add an `isLiked` property to each social record
        socials.Records = await Promise.all(socials.Records.map(async (social) => {
            // Convert each social object to a plain JSON object
            const socialJson = JSON.parse(JSON.stringify(social));

            // Fetch comments and likes asynchronously
            const comments = await getComment({ social_id: socialJson.social_id });
            const likes = await getLike({ social_id: socialJson.social_id });
            const saves = await getSave({ social_id: socialJson.social_id });
            // const isFollowing = await isFollow({ follower_id: user_id, user_id: socialJson.user_id })
            // Add the isLiked, total_comments, and total_likes properties
            // socialJson.isLiked = likedSocialIds.has(socialJson.social_id);
            // socialJson.isSaved= savedSocialIds.has(socialJson.social_id);
            socialJson.total_comments = comments.Pagination.total_records;
            socialJson.total_likes = likes.Pagination.total_records;
            socialJson.total_saves = saves.Pagination.total_records;

            // Add the isLiked, total_comments, and total_likes properties


            return socialJson;
        }));

        return generalResponse(
            res,
            {
                Records: socials.Records,
                Pagination: socials.Pagination
            },
            "Socials Found",
            true,
            false
        );


    } catch (error) {
        console.error("Error in finding social", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while finding social!",
            false,
            true
        );
    }
}
async function updateSocialsAdmin(req, res) {
    try {
        let allowedUpdateFields = [];


        allowedUpdateFields = ['social_id', 'status']

        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
        }
        catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                err.message,
                false,
                true
            );
        }



        const socials = await getSocial(
            { social_id: filteredData.social_id },
        );

        // Filter out blocked users
        if (socials?.Records?.length <= 0) {
            return generalResponse(
                res,
                {
                    Records: [],
                    Pagination: {}
                },
                "Socials not found",
                true,
                true,
                // 400
            );
        }
        const updatedSocial = await updateSocial({ social_id: filteredData.social_id }, { status: filteredData.status })
        const updatedsocials = await getSocial(
            { social_id: filteredData.social_id },
        );


        return generalResponse(
            res,
            updatedsocials,
            "Socials Found",
            true,
            false
        );


    } catch (error) {
        console.error("Error in updating social", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while updating social!",
            false,
            true
        );
    }
}
async function addViews(req, res) {
    try {
        const user_id = req.authData.user_id

        let allowedUpdateFields = [];

        allowedUpdateFields = ['social_ids']
        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
        }
        catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                "Data is Missing",
                false,
                true
            );
        }
        if (filteredData.social_ids.length <= 0) {
            return generalResponse(
                res,
                {},
                "Social Ids are missing",
                false,
                true,
                404
            );
        }
        if (await getUser({ user_id })) {
            for (let i = 0; i < filteredData.social_ids.length; i++) {
                const social = await getSocial({ social_id: filteredData.social_ids[i] });
                if (social.Records.length > 0) { // Check if a record exists
                    social.Records[0].total_views = social.Records[0].total_views + 1; // Increment views


                    await updateSocial({ social_id: filteredData.social_ids[i] }, { total_views: social.Records[0].dataValues.total_views }); // Pass only the updated record
                }
            }

            // Send response after processing all social IDs
            return generalResponse(
                res,
                {},
                "Views Added Successfully",
                true,
                false
            );




        } else {
            return generalResponse(
                res,
                {},
                "User not found",
                false,
                true,
                404
            );
        }

    } catch (error) {
        console.error("Error in adding Views", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while adding views!",
            false,
            true
        );
    }
}

async function deleteSocials(req, res) {
    try {
        const user_id = req.authData.user_id
        if (process.env.ISDEMO == "true") {
            console.log("running", req.userData.user_name);
            
            let demo_user_names = [
                "williams654",
                "james55",
                "george43",
                "thomas1871",
                "martha34",
                "jane00",
                "johnbrook",
                "kevintemp",
                "kanika",
                "Jessicalauren",
                "SmithMurphy",
                "ameliamarg",
                "fitfoodie",
                "fabos_demo",
                "tonnygreg",

            ]
            if (demo_user_names.includes(req.userData.user_name)) {
                return generalResponse(
                    res,
                    {},
                    "You are not allowed to edit as it is the property of demo user",
                    false,
                    true,
                    // 403
                )
            }
        }
        const { page = 1, pageSize = 10 } = req.body

        let allowedUpdateFields = [];

        allowedUpdateFields = ['social_id']
        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
        }
        catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                "Data is Missing",
                false,
                true
            );
        }
        const isUser = await getUser({ user_id })
        if (isUser) {

            const socials = await getSocial(filteredData, pagination = { page, pageSize }, excludedUserIds = []);

            // Filter out blocked users
            if (socials?.Records?.length <= 0) {
                return generalResponse(
                    res,
                    {
                        Records: [],
                        Pagination: {}
                    },
                    "Socials not found",
                    true,
                    true,
                    // 400
                );
            }


            // const deletedSocials = await deleteSocial(filteredData)
            const updatedSocial = await updateSocial({ social_id: filteredData.social_id, user_id: user_id }, { deleted_by_user: true })
            const deletedNotification = await deleteNotification({
                social_id: filteredData.social_id
            })
            const updated_user = await updateUser({ total_socials: isUser.total_socials - 1 }, { user_id: user_id },)

            if (updatedSocial) {
                return generalResponse(
                    res,
                    {

                    },
                    "Social delted Successfully",
                    true,
                    true
                );
            }

            return generalResponse(
                res,
                {},
                "Social not deleted ",
                false,
                false
            );
        } else {
            return generalResponse(
                res,
                {},
                "User not found",
                false,
                true,
                404
            );
        }

    } catch (error) {
        console.error("Error in Deleting social", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while Deleting social!",
            false,
            true
        );
    }
}


async function editSocial(req, res) {
    try {
        const social_type = req.body.social_type
        const user_id = req.authData.user_id
        if (process.env.ISDEMO == "true") {
            console.log("running", req.userData.user_name);

            let demo_user_names = [
                "williams654",
                "james55",
                "george43",
                "thomas1871",
                "martha34",
                "jane00",
                "johnbrook",
                "kevintemp",
                "kanika",
                "Jessicalauren",
                "SmithMurphy",
                "ameliamarg",
                "fitfoodie",
                "fabos_demo",
                "tonnygreg",

            ]
            if (demo_user_names.includes(req.userData.user_name)) {
                return generalResponse(
                    res,
                    {},
                    "You are not allowed to edit as it is the property of demo user",
                    false,
                    true,
                    // 403
                )
            }
        }
        
        if (!req.body.social_id) {
            return generalResponse(
                res,
                {},
                "social_id is required",
                false,
                402
            )
        }
        let allowedUpdateFieldsMandatory = [];
        let allowedUpdateFields = [];
        let post_media
        // if (process.env.MEDIAFLOW == "S3") {
        //     if (!req.body.file_media_1) {
        //         return generalResponse(
        //             res,
        //             {},
        //             "File Data is missing",
        //             false,
        //             true,
        //             404
        //         );
        //     }

        //     post_media = req.body.file_media_1
        // }
        // else {

        //     post_media = req.files[0].path
        // }
        // let media_location
        // if (social_type == "reel") {
        //     if (process.env.MEDIAFLOW == "S3") {
        //         if (!req.body.file_media_2) {
        //             return generalResponse(
        //                 res,
        //                 {},
        //                 "File Data is missing",
        //                 false,
        //                 true,
        //                 404
        //             );
        //         }

        //         media_location = req.body.file_media_2
        //     }
        //     else {
        //         media_location = req.files[1].path

        //     }
        // }
        allowedUpdateFieldsMandatory = ['social_desc', 'social_type', 'location', 'taged', 'files', 'aspect_ratio', 'video_hight', 'music_id']
        let filteredData;
        try {
            filteredData = updateFieldsFilter(req.body, allowedUpdateFieldsMandatory);
            filteredData.user_id = user_id
        }
        catch (err) {
            console.log(err);
            return generalResponse(
                res,
                { success: false },
                "Data is Missing",
                false,
                true
            );
        }
        const isUser = await getUser(filteredData)

        if (!isUser) {
            // return generalResponse(
            //     res, req.files[1].path

            // )
        }
        filteredData.country = isUser.country
        if (filteredData.social_desc) {
            filteredData.hashtag = extractHashtags(filteredData.social_desc);
        }
        if (filteredData?.hashtag || filteredData?.hashtag?.length > 0) {
            filteredData.hashtag.forEach(async (hashtag) => {
                const isHashtag = await getHashTags({ hashtag_name: hashtag })

                if (isHashtag.Records.length <= 0) {
                    await createHashtag({ hashtag_name: hashtag, counts: 1 })
                }
                else {

                    await updateHashtag({ counts: isHashtag.Records[0].counts + 1 }, { hashtag_name: isHashtag.Records[0].hashtag_name })
                }
            })
        }


        if (social_type == 'post') {

            // const post = await createSocial(
            //     filteredData
            // )
            const updated_post = await updateSocial({ social_id: req.body.social_id }, filteredData)
            // if (post) {
            //     const mediaPromises = req.files.map((file) => {
            //         const mediaData = {
            //             social_id: post.social_id,
            //             media_location: file.path, // Assuming `file.path` contains the uploaded file's location
            //         };

            //         // Call createMedia function for each file
            //         return createMedia(mediaData);
            //     });

            //     // Wait for all media entries to be created
            //     const mediaResults = await Promise.all(mediaPromises);
            //     const updated_user = await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id: user_id })
            //     if (mediaResults) {
            //         return generalResponse(
            //             res,
            //             {},
            //             "Post Uploaded Successfully",
            //             true,
            //             true
            //         )
            //     }
            //     return generalResponse(
            //         res,
            //         {},
            //         "Failed to Upload post",
            //         ture,
            //         true
            //     )
            // }
            return generalResponse(
                res,
                {},
                "Post updaated Successfully",
                true,
                true
            )

        }
        else if (social_type == 'reel') {
            const updated_post = await updateSocial({ social_id: req.body.social_id }, filteredData)
            return generalResponse(
                res,
                {},
                "Reel updaated Successfully",
                true,
                true
            )
            // filteredData.reel_thumbnail = post_media
            // const reel = await createSocial(
            //     filteredData
            // )
            // if (reel) {

            //     const media = createMedia(
            //         {
            //             social_id: reel.social_id,
            //             media_location: media_location
            //         }
            //     )
            //     if (media) {


            //         const updated_user = await updateUser({ total_socials: isUser.total_socials + 1 }, { user_id: user_id })
            //         if (reel.music_id) {
            //             const get_music = await getMusic({
            //                 music_id: reel.music_id
            //             })
            //             if (get_music.Pagination.total_records > 0) {
            //                 const update_music = updateMusic(
            //                     {
            //                         total_use: get_music.Records[0].total_use + 1
            //                     }
            //                 )
            //             }

            //         }
            //         return generalResponse(
            //             res,
            //             {},
            //             "Reel Uploaded Successfully",
            //             true,
            //             true
            //         )
            //     }
            //     return generalResponse(
            //         res,
            //         {},
            //         "Failed to Upload post",
            //         ture,
            //         true
            //     )
            // }
            // return generalResponse(
            //     res,
            //     {},
            //     "Failed to Upload post",
            //     ture,
            //     true
            // )
        }
        return generalResponse(
            res,
            "Failed to Upload",
            false,
            true,

        );

    } catch (error) {
        console.error("Error in updating social", error);
        return generalResponse(
            res,
            { success: false },
            "Something went wrong while updating social!",
            false,
            true
        );
    }
}

module.exports = {
    uploadSocial,
    showSocials,
    deleteSocials,
    addViews,
    showSocialsAdmin,
    updateSocialsAdmin,
    uploadMediaS3,
    editSocial,
    showSocialswithoutauth,
    getSocialsOfFollowers
};      
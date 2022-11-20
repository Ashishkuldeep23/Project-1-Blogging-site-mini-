const authorModel = require('../model/authorModel')
const blogModel = require('../model/blogModel')


// // For objectId validation -->
const mongoose = require('mongoose');





const blogs = async function (req, res) {

    try {
        // // All Data From Body putting in data var.
        let data = req.body
        if (Object.keys(data).length <= 0) return res.status(400).send({ status: false, message: "Give some required data to make new blog." });

        // // All Mandatory field taking out and checking present or not , if  not present then send an err msg. 
        let { title, body, authorId, category } = req.body

        if (!title || !body || !authorId || !category) return res.status(400).send({ status: false, msg: "Mandatory field is not given" })

        // // Extractin author id from body and checking , this authorId present in DB collection or not. if not present then send error.
        authorId = req.body.authorId

        if (!mongoose.Types.ObjectId.isValid(authorId)) return res.status(400).send({ status: false, msg: "Invalid Author Id" })

        // // // Find data with authorId
        let isAuthorPresent = await authorModel.findOne({ _id: authorId })

        if (!isAuthorPresent) return res.status(400).send({ status: false, message: "Invalid Author Id" })

        // // Extracting two keys from body bez we need to do extra date acc. to true or false.
        let isPublished = req.body.isPublished
        let isDeleted = req.body.isDeleted


        // // If isPulished is true then do two thing -> attach current date to pulishedAt key and make true isPublished

        if (isPublished) { req.body.publishedAt =  Date.now()}
        if (isDeleted){ req.body.deletedAt =  Date.now()}
    


        // // // If everyThing is right then created blog with this data and send back into response. 
        let newData = await blogModel.create(data)
        res.status(201).send({ status: true, data: newData })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message })
    }

}







const newGetApi = async function(req ,res ){
    // const { authorId, category, tags, subcategory } = req.query

    let query = req.query

    // console.log(query)

    for(let key in query){
        if(key!="category" && key!="subcategory" && key!="tags" && key!="title" && key!= "authorId") return res.status(400).send({status : false , message: "Key does't exist in DB , check key name please."})
    }
    
    // console.log(query)

    // // Below line is best for using filter data by query params it is nice way to do same job then above function.
    // // But time wise above Query is taking less time then this query. 

    let findObj = {isDeleted:false , isPublished : true , ...query}

    // console.log(findObj)
    
    let data = await blogModel.find(findObj)

    if (data.length <= 0) return res.status(404).send({ status: false, message: 'No Data Found with given key.' })

    res.status(200).send({ status: true , AllDataAre: data.length , data: data })

}

// // // // Till Day 1 ------


// // // Start day 2

const updateBlog = async function (req, res) {
    try {

        let updatedBody = req.body;
        let { title, body, category, isPublished, tags, subcategory } = updatedBody;

        if (Object.keys(updatedBody).length <= 0) return res.status(400).send({ status: false, message: "Data must be present" });
        
        let blogId = req.params.blogId;

        // if (!mongoose.Types.ObjectId.isValid(blogId)) return res.status(400).send({ Status: false, msg: "Invalid Blog Id" })

        let blogPresent = await blogModel.findById(blogId);

        if (!blogPresent) return res.status(400).send({ status: false, message: "Blog id is Incorrect" });


        if (blogPresent["isDeleted"] == true) {
            return res.status(404).send({ status: false, message: "Blog is already deleted" });
        }

        // For PublisheAt value --->
        let publishDateAndTime;
        req.body.isPublished ? publishDateAndTime = Date.now() : publishDateAndTime = null

        let updatedBlog = await blogModel.findOneAndUpdate(
            { _id: blogId },
            { $set: { title, body, category, isPublished, publishedAt: publishDateAndTime }, $push: { tags: tags, subcategory: subcategory } },
            { new: true }
        );


        res.status(200).send({ status: true, message: "Blog has been successfully updated", Data: updatedBlog });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message || "Some server error occured" });

    }

}





const deleteBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId

        // // Check object id is valid or not by mongoose predefind method.

        // if (!mongoose.Types.ObjectId.isValid(blogId)) return res.status(400).send({ Status: false, msg: "Invalid Blog Id" })


        let isBlogPresent = await blogModel.findOne({ _id: blogId })

        if (!isBlogPresent) return res.status(400).send({ status: false, message: "Invalid Blog Id or the blog is not exist" })


        if (isBlogPresent.isDeleted == true) return res.status(400).send({ status: false, msg: "Blog is already deleted." })


        let del = await blogModel.findOneAndUpdate({ _id: blogId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: Date.now() } })

        res.status(200).send()
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }


}







const deletBlogByQueryNew = async function(req ,res){
    let findObj = { isDeleted: false  , isPublished : false , ...req.query}

    let tokenAuthorId = req.tokenAuthorId

    let authorIdInQuery = req.query.authorId
    if(authorIdInQuery){

        if(tokenAuthorId != authorIdInQuery) return res.status(403).send({status : false , message : "You are not authorized to do that, token athorId is different from query authorId, Forbidden"})

        findObj.authorId = tokenAuthorId
        if ( Object.keys(findObj).length <= 3) return res.status(400).send({ status: false, message: "Please give some data that you want to delete that is not deleted" })


    }else{

        findObj.authorId = tokenAuthorId
        if ( Object.keys(findObj).length <= 3) return res.status(400).send({ status: false, message: "Please give some data that you want to delete that is not deleted" })

    }

    // console.log(findObj)



    let data = await blogModel.updateMany(
        findObj,
        { $set: { isDeleted: true, deletedAt: Date.now() } }
    )

    if (data.matchedCount <= 0) return res.status(404).send({ status: false, message: "No Data Found" })

    res.status(200).send({ status: true, message: `${data.matchedCount} is deleted` })

}










module.exports = {  blogs,  updateBlog, deleteBlog ,newGetApi , deletBlogByQueryNew }


















// // // // Privious logics are ----->




// // // Get get with query params 
// const allBlogs = async function (req, res) {

//     try {

//         // // All query field extractng here to search data with these field
//         const { authorId, category, tags, subcategory } = req.query

//         // // Creating a findObj here all find field is present (Two field present every time)
//         let findObj = {
//             isDeleted: false,
//             isPublished: true
//         }

//         // // If any more field is given in query params then add that field into findObj and then find data in DB (Object concept)
//         if (authorId) {
//             findObj["authorId"] = authorId
//         }
//         if (category) {
//             findObj["category"] = category
//         }
//         if (tags) {
//             findObj["tags"] = tags
//         }
//         if (subcategory) {
//             findObj["subcategory"] = subcategory
//         }

//         // // // Find data with findObj , if no data find then send 404 err No Data Found otherwise send data in response.
//         let data = await blogModel.find(findObj)

//         if (data.length <= 0) return res.status(404).send({ status: false, message: 'No Data Found' })

//         res.status(200).send({ status: true, AllDataAre: data.length, data: data })

//     } catch (err) {
//         console.log(err)
//         res.status(500).send({ status: false, message: err.message })
//     }


// }





// // // // Delete data by Query Params ---------------------->

// const deletBlogByQuery = async function (req, res) {
//     try {

//         const query = req.query
//         const { category , tags, subcategory } = query


//         // // // Every time when user want to delete data by query then give author id for authorisation purpose and blog should be not deleted.
//         let findObj = { isDeleted: false  , isPublished : false }


//         // // // In next line we are looking user is authentic user and he/she can delete blog in own blogs.
//         let tokenAuthorId = req.tokenAuthorId
//         // // Adding one attribute in findObj that is authorId by token data.
//         findObj.authorId = tokenAuthorId



//         if (category) {
//             findObj["category"] = category
//         }
//         if (tags) {
//             findObj["tags"] = tags
//         }
//         if (subcategory) {
//             findObj["subcategory"] = subcategory
//         }



//         // // Any data coming on query or not ?
//         if ( Object.keys(findObj).length <= 3) return res.status(400).send({ status: false, message: "Please give some data that you want to delete that is not deleted" })

//         let data = await blogModel.updateMany(
//             findObj,
//             { $set: { isDeleted: true, deletedAt: Date.now() } }
//         )

//         // How many data matched with condition -->
//         if (data.matchedCount <= 0) return res.status(404).send({ status: false, message: "No Data Found" })

//         res.status(200).send({ status: true, message: `${data.matchedCount} is deleted` })

//     } catch (err) {
//         console.log(err)
//         res.status(500).send({ status: false, message: err.message })
//     }

// }

const express = require('express');
const router = express.Router();

const blogController = require("../controller/blogController")

const authorController = require("../controller/authorController")

const {authorisation , authentication} = require('../middleware/middleware')


router.get("/test-me", (req, res)=> { res.status(200).send("All Done")})


router.post("/authors", authorController.authors)


router.post("/blogs" , authentication, blogController.blogs)


// router.get("/blogs", authentication , blogController.allBlogs)
 // // // Or Or Or
router.get("/blogs", authentication,  blogController.newGetApi)



router.put("/blogs/:blogId", authentication , authorisation , blogController.updateBlog);


router.delete("/blogs/:blogId", authentication , authorisation , blogController.deleteBlog)


// router.delete("/blogs" , authentication , blogController.deletBlogByQuery )
// // // Or Or Or 
router.delete("/blogs" ,authentication , blogController.deletBlogByQueryNew )


router.post("/login" , authorController.loginAuthor)



module.exports = router
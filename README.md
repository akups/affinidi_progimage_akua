# Affinidi_ProgImage.com

Intro:

ProgImage.com is a programmatic image storage and processing service.

ProgImage is designed as a specialised image storage and processing engine to be used by other applications, and will (only) provide high-performance access via its API.

Apart from bulk image storage and retrieval, ProgImage provides several image processing and transformation capabilities such as compression, rotation, a variety of filters, thumbnail creation, and masking.

These capabilities are all delivered as a set of high-performance web-services that can operate on images provided as data in a request, operate on a remote image via a URL, or on images that are already in the repository. All of the processing features should be able to operate in bulk, and at a significant scale.

Core Technical Concepts/Inspiration

- With proimage developers can focus on their core sites and implement all image process needed with the proImage solution
- Unlike other image storage services that have a web front-end and target end-users, ProgImage is designed as a specialised image storage and processing engine to be used by other applications, and will (only) provide high-performance access via its API.
- ProImage uses Busyboy and sharp as the main image processing tools and saves the data in Mongo Atlas whilst creating an S3 bucket that stores the images as well as creates unique urlls for easy retrieval by users

1. First an S3 bucket was manually created on the AWS console
2. https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
   using the informtion on this link I set my parameters for my S3 bucket I created a .env file to hide all keys and passwords in a secure place
3. In order to use process.env to access the keys in the .env file dotenv is installed and required in the creation
   of the app
4. fileStorage.js uploads the image to the AWS S3 bucket and creates a unique url for each created image aws-dk is  
   installed and required to handle this process. uploadFile, S3, and Bucket
5. Creation of database - a mongo database is created to store the images for retrieval and processing
6. the app creation process requires other dependencies

Dependencies:

- express - facilitating rapid development of our app
- Busboy - for processing the image into a buffer that'll be then sent to S3
- uuid - that insures that each created image will have a unique id with which it can be queried
- sharp - for transformation of images into different formats
- sharp can do further perfomances on the images for the prupose of the assignment not every example is shown.

Bus boy recieves the file from the folder on the computer and processes it into a buffer that is passed on to the S3 bucket where a url for it is created. After this process the images are stored in the mongo database collection with all the parameters specified in the schema. With the aide of postman:
Swimlanes diagrams are used to describe the various processes.

Image Processing:

- first endpoint for creation/saving of the images
  https://swimlanes.io/u/s8o1iJCJL
  the client in my case postman sends a post request in order to create the image. The file is selected from the folder and through Busboy is transformed into a buffer which is sent to the S3 bucket and subsequently a unique url will be created

- second endpoint to retrieve an image with the unique id
  https://swimlanes.io/u/NpTH_fqB7
  the client send a GET request to the server with a specific id to retireve the image that is saved in our mongo database that corresponds to this particular id. the server sends the url pf this image back to the client

- third endpoint to format a specific image and retrieve the formatted version
  https://swimlanes.io/u/ffv0s5TEa
  the client sends a GET request to the server with a specific imageID and a required format that should be returned
  the imagerecord in the mogo database matching this id is retireved and by the help of sharp tranformed to what was requested
  the new imageFile is sent to the S3 bucket
  S3 returns to the server a new url corrseponding to the formatted version of the image
  the new url is sent to the client

  Testing:

let chai = require('chai');
let server = require('../../server');
const supertest = require('supertest');
const should = chai.should();
const api = supertest.agent(server);
const urlblog = '/api/v1/blogArticle/';
const urlfiles = '/api/v1/fileManager/';
global.idBlogJobaas = "";
global.idBlogJobaas2 = "";
global.headerImageUrl = ""
global.idBlogCV = "";

global.idThreadComment1 = "";
global.idThreadComment2 = "";
global.idThreadComment3 = "";



//test communication member team create a blog Article
describe('POST '+urlblog, () => {
    it('should respond with a success message along with a single blog article that was added', (done) => {
        api.post(urlblog + '?lang=en')
      .send({
            "category": "Jobaas",
            "title": "Jobaas et sa lutte contre le chomage",
            "text": "Au lancement de ses activités, Jobaas affichait comme mission première de lutter contre le chômage en facilitant la recherche d'emploi au Cameroun. Si cette facilitation s'est articulée depuis son lancement autour de sa plateforme en ligne Jobaas.cm la société a maintenant rajouté un nouvel outil pour mettre en relation employeurs et chercheurs d'emplois. Il s'agit d'un évènement physique qui mettra en relation écoles, entreprises et chercheurs d'emplois. RDV en mars 2023 pour voir ce que cet évènement apportera aux différentes parties",
            "state": "draft"
      }).set('authorization','Bearer '+global.communication_memberToken )
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "created")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        //check the message content
        res.body.message.should.eql('new blog article was created');

        global.idBlogJobaas = res.body.data.id;
        done();
      });
    });
  });

//test communication member team create a blog Article
describe('POST '+urlblog, () => {
    it('should respond with a success message along with a single blog article that was added', (done) => {
        api.post(urlblog + '?lang=en')
      .send({
            "category": "Jobaas",
            "title": "Le forum de l'emploi : le programme",
            "text": "espace présentations d'entreprise et leurs activités, ateliers cvs et entretiens, job dating offres de stage et cdis, espace présentation écoles et leurs activités",
            "state": "published"
      }).set('authorization','Bearer '+global.communication_memberToken )
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "created")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        //check the message content
        res.body.message.should.eql('new blog article was created');

        global.idBlogJobaas2 = res.body.data.id;
        done();
      });
    });
  });

//test communication member team create a blog Article
describe('POST '+urlblog, () => {
    it('should respond with a success message along with a single blog article that was added', (done) => {
        api.post(urlblog + '?lang=en')
            .send({
                "category": "Jobaas",
                "title": "Négociation salariale",
                "text": "espace présentations d'entreprise et leurs activités, ateliers cvs et entretiens, job dating offres de stage et cdis, espace présentation écoles et leurs activités",
                "state": "published"
            }).set('authorization','Bearer '+global.communication_memberToken )
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                res.body.message.should.eql('new blog article was created');
                global.idBlogJobaas2 = res.body.data.id;
                done();
            });
    });
});

//test communication member team create a blog Article
describe('POST '+urlblog, () => {
    it('should respond with a success message along with a single blog article that was added', (done) => {
        api.post(urlblog + '?lang=en')
            .send({
                "category": "cover_letter",
                "title": "Comment concevoir une lettre",
                "text": "espace présentations d'entreprise et leurs activités, ateliers cvs et entretiens, job dating offres de stage et cdis, espace présentation écoles et leurs activités",
                "state": "published"
            }).set('authorization','Bearer '+global.communication_memberToken )
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                res.body.message.should.eql('new blog article was created');
                global.idBlogJobaas2 = res.body.data.id;
                done();
            });
    });
});

//test communication member team add an image header to the blog Article
describe('POST '+urlblog+'ImageHeader', () => {
    it('should respond with a success message along with the header image of a blog article that was added', (done) => {
        api.post(urlblog + global.idBlogJobaas + '/ImageHeader' + '?lang=en&typeOwner=administrator&idBlogArticle='+global.idBlogJobaas+'&fileType=logoBlogArticle')
//test communication member team add an image header to the blog Article
.set('authorization','Bearer '+global.communication_memberToken )
.attach("file", "test/files_test/forum emploi.jpg")
.end((err, res) => {
  // there should be no errors
  should.not.exist(err);
  // there should be a 200 status code
  // (indicating that something was "created")
  res.status.should.equal(200);
  // the response should be JSON
  res.type.should.equal('application/json');
  // the JSON response body should have a
  // key-value pair of {"status": "success"}
  //check the message content
  res.body.message.should.eql('new file was created');
  res.body.data.fileUploaded.should.eql(true);
  global.headerImageUrl = res.body.data.url;
  done();
});
});
});    
describe('POST '+urlblog+'createImageHeader', () => {
    it('should respond with a success message along with the header image of a blog article that was added', (done) => {
        api.post(urlblog + 'createImageHeader' + '?lang=en&typeOwner=Jobaas Communication&idBlogArticle='+global.idBlogJobaas+'&fileType=logoBlogArticle')
        api.post(urlblog + global.idBlogJobaas + '/ImageHeader' + '?lang=en&typeOwner=administrator&fileType=logoBlogArticle')
      .set('authorization','Bearer '+global.communication_memberToken )
      .attach("file", "test/files_test/forum emploi.jpg")
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "created")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        //check the message content
        res.body.message.should.eql('new file was created');
        res.body.data.fileUploaded.should.eql(true);
        global.headerImageUrl = res.body.data.url;
        done();
      });
    });
  });

//test update a blog Article
describe('PUT '+urlblog+':idBlogArticle', () => {
    it('should respond with a success message along with a single blog article that was retrieved from database', (done) => {
        api.put(urlblog + global.idBlogJobaas + '?lang=en')
      .send({
        "state": "published",
        "title": "Surprise de Jobaas"
      })
      .set('authorization','Bearer '+global.communication_memberToken )
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "created")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        //check the message content
        res.body.message.should.eql("the blog's article was updated");
        res.body.data.updateAt.length.should.eql(3);
        done();
      });
    });
  });

//TODO UNIT TEST UPDATE FILE
//test communication member team add an image header to the blog Article
//describe('PUT '+urlblog+'updateImageHeader/:idFile', () => {
//    it('should respond with a success message along with the header image of a blog article that was added', (done) => {
//        api.post(urlblog + 'updateImageHeader/'+ :idFile + '?lang=en&typeOwner=Jobaas Communication&idBlogArticle='+global.idBlogJobaas+'&fileType=logoBlogArticle')
//      .set('authorization','Bearer '+global.communication_memberToken )
//      .attach("file", "test/files_test/jober1.jpg")
//      .end((err, res) => {
//        // there should be no errors
//        should.not.exist(err);
//        // there should be a 200 status code
//        // (indicating that something was "created")
//        res.status.should.equal(200);
//        // the response should be JSON
//        res.type.should.equal('application/json');
//        // the JSON response body should have a
//        // key-value pair of {"status": "success"}
//        //check the message content
//        res.body.message.should.eql('the file was updated by id');
//
//        global.headerImageUrl = res.body.data.url;
//        done();
//      });
//    });
//  });


//test get a blog Article
describe('GET '+urlblog+':idBlogArticle', () => {
    it('should respond with a success message along with a single blog article that was retrieved from database', (done) => {
        api.get(urlblog + global.idBlogJobaas + '?lang=en')
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "created")
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        //check the message content
        res.body.message.should.eql('The article has been found');
        res.body.data.statistics.nbViews.should.equal(1);
        done();
      });
    });
  });

describe('PUT '+urlblog+':idBlogArticle/disable', () => {
    it('should respond with a success message along with a single blog article that was updatedfrom database',
        (done) => {
            api.put(urlblog + global.idBlogJobaas + '/disable?lang=en')
                .set('authorization','Bearer '+global.communication_memberToken )
                .end((err, res) => {
                    // there should be no errors
                    should.not.exist(err);
                    // there should be a 200 status code
                    // (indicating that something was "created")
                    res.status.should.equal(200);
                    // the response should be JSON
                    res.type.should.equal('application/json');
                    // the JSON response body should have a
                    // key-value pair of {"status": "success"}
                    //check the message content
                    res.body.message.should.eql('blogArticle disabled');
                    done();
                });
        });
});

describe('PUT '+urlblog+':idBlogArticle/enable', () => {
    it('should respond with a success message along with a single blog article that was updatedfrom database',
        (done) => {
            api.put(urlblog + global.idBlogJobaas + '/enable?lang=en')
                .set('authorization','Bearer '+global.communication_memberToken )
                .end((err, res) => {
                    // there should be no errors
                    should.not.exist(err);
                    // there should be a 200 status code
                    // (indicating that something was "created")
                    res.status.should.equal(200);
                    // the response should be JSON
                    res.type.should.equal('application/json');
                    // the JSON response body should have a
                    // key-value pair of {"status": "success"}
                    //check the message content
                    res.body.message.should.eql('blogArticle enabled');
                    done();
                });
        });
});

describe('PUT '+urlblog+':idBlogArticle/like', () => {
    it('should respond with a success message along with a single blog article that was updatedfrom database',
        (done) => {
            api.put(urlblog + global.idBlogJobaas + '/like?lang=en')
                .set('authorization','Bearer '+ global.tokenJober2 )
                .end((err, res) => {
                    // there should be no errors
                    should.not.exist(err);
                    // there should be a 200 status code
                    // (indicating that something was "created")
                    res.status.should.equal(200);
                    // the response should be JSON
                    res.type.should.equal('application/json');
                    // the JSON response body should have a
                    // key-value pair of {"status": "success"}
                    //check the message content
                    res.body.message.should.eql('blogArticle liked');
                    done();
                });
        });
});

//test get a blog Article with the right number of like
describe('GET '+urlblog+':idBlogArticle', () => {
    it('should respond with a success message along with a single blog article that was retrieved from database with the right number of likes' +
        '', (done) => {
        api.get(urlblog + global.idBlogJobaas + '?lang=en')
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 200 status code
                // (indicating that something was "created")
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a
                // key-value pair of {"status": "success"}
                //check the message content
                res.body.message.should.eql('The article has been found');
                res.body.data.statistics.nbLikes.should.eql(1);
                done();
            });
    });
});


//test particular create a blog Article
describe('POST '+urlblog, () => {
    it('should respond with a success message along with a single blog article that was added', (done) => {
        api.post(urlblog + '?lang=en')
      .send({
            "category": "Jobaas",
            "title": "Les cv",
            "text": "test raté",
            "state": "draft"
      }).set('authorization','Bearer '+global.tokenJober3 )
      .end((err, res) => {
        // there should be no errors
        should.not.exist(err);
        // there should be a 200 status code
        // (indicating that something was "created")
        res.status.should.equal(403);
        // the response should be JSON
        res.type.should.equal('application/json');
        // the JSON response body should have a
        // key-value pair of {"status": "success"}
        //check the message content
        res.body.message.should.eql(' FORBIDDEN YOU DO NOT HAVE THE REQUIRED PERMISSION ');
        done();
      });
    });
  });

  

//test get all blog Articles
describe('GET '+urlblog, () => {
  it('should respond with a success message along with a single blog article that was retrieved from database', (done) => {
      api.get(urlblog + '?lang=en')
    .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      // (indicating that something was "created")
      res.status.should.equal(200);
      // the response should be JSON
      res.type.should.equal('application/json');
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      //check the message content
      res.body.data.length.should.equal(1);

      done();
    });
  });
});

//test get a blog Article
describe('GET '+urlblog+':idBlogArticle', () => {
  it('should respond with a success message along with a single blog article that was retrieved from database', (done) => {
      api.get(urlblog + global.idBlogJobaas2 + '?lang=en')
    .end((err, res) => {
      // there should be no errors
      should.not.exist(err);
      // there should be a 200 status code
      // (indicating that something was "created")
      res.status.should.equal(200);
      // the response should be JSON
      res.type.should.equal('application/json');
      // the JSON response body should have a
      // key-value pair of {"status": "success"}
      //check the message content
      res.body.data.statistics.nbViews.should.eql(1);
      res.body.message.should.eql('The article has been found');

      done();
    });
  });
});
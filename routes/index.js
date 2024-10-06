/** ********
 * index.js file (for routes)
 **********/
const path = require("path");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../configs/swagger.json");
const apiRoute = "/api/v1/";
const config = require("../configs/environnement/config");
const endPoints = [];
const express = require("express");
const jobService = require("../services/job");
const enum_utils = require("../common/utils/enum");
const processing_utils = require("../common/utils/processing");
const _ = require("lodash");
const { replaceTagForSEO } = require("../common/utils/processing");

const init = (server) => {
  const indexPath = path.join(__dirname, "../react-app/build/index.html");
  const genericMetaImage =
    "https://res.cloudinary.com/jobaas-files/image/upload/v1597592654/jobaas/logo_jobass_2020_08_04._vsuisq.png";
  const genericMetaTags = [
    "cameroun, jobs, missions, CDI, CDD, saisonniers, emploi, travail, annonce, chômage",
  ];
  const genericPublishedDate = new Date("2020-12-14");

  // Load all the js file in this folder :
  // Set up routes
  fs.readdirSync(__dirname).forEach(function (routeFile) {
    if (routeFile === "index.js" || routeFile === "litigation.js") return;
    const routeFileCompletePath = path.join(__dirname, routeFile);
    const stat = fs.statSync(routeFileCompletePath);
    if (stat && !stat.isDirectory()) {
      endPoints.push(routeFileCompletePath);
      server.use(
        apiRoute + path.basename(routeFile, ".js"),
        require("./" + path.basename(routeFile, ".js"))
      );
    }
  });

  // server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  swaggerDocument.host =
    config.hostname === "localhost"
      ? config.hostname + ":" + config.port
      : config.hostname;
  if (config.env !== "./production") {
    server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
  server.use(express.static(path.join(__dirname, "../react-app/build")));

  server.get("/", async (req, res) => {
    res.set("Cache-control", "public, max-age=200");
    let htmlData = fs.readFileSync(indexPath, "utf8");
    const tagForSEO = {
      description:
        "Job As A Service est une plateforme  de recherche d'emploi au Cameroun. Trouvez un travail au Cameroun grace à Jobaas, recrutez au Cameroun grace à Jobaas",
      title: "Accueil | Jobaas | Cameroun",
      metaImage: genericMetaImage,
      publishedTime: genericPublishedDate,
      keywords: genericMetaTags,
    };
    htmlData = replaceTagForSEO(htmlData, tagForSEO);
    res.send(htmlData);
  });

  server.get("/fr/job/title_job/:jobSlug", async (req, res) => {
    res.set("Cache-control", "public, max-age=200");
    let htmlData = fs.readFileSync(indexPath, "utf8");
    const jobSlug = req.params.jobSlug;
    const jobPost = await jobService.getJobBySlugForSEO(jobSlug);
    if (!jobPost) {
      res.redirect("/fr/jobs");
    } else {
      const url =
        req.protocol + "://" + req.get("host") + "/fr/job/title_job/" + jobSlug;
      let tags = jobPost.tags;
      tags = enum_utils.bdd_to_tag(tags, "fr");
      let keywords = genericMetaTags.concat(tags);
      keywords = keywords.join(",");
      let intercept = _.intersectionWith(jobPost.tags, enum_utils.tags);
      let metaImage = processing_utils.getImageRelatedToTag(intercept[0]);
      let title = `Annonce d'emploi | ${jobPost.title} | Jobaas | Cameroun`;
      // inject meta tags
      const tagForSEO = {
        description: jobPost.description,
        title: title,
        url: url,
        metaImage: metaImage,
        publishedTime: jobPost.registrationDate,
        modifiedAt: jobPost.updateAt,
        keywords: keywords,
      };
      htmlData = replaceTagForSEO(htmlData, tagForSEO);
      res.send(htmlData);
    }
  });

  server.get("/fr/register", async (req, res) => {
    res.set("Cache-control", "public, max-age=200");
    let htmlData = fs.readFileSync(indexPath, "utf8");
    const url = req.protocol + "://" + req.get("host") + "/fr/register";
    // inject meta tags
    const tagForSEO = {
      description:
        "Inscrivez vous gratuitement sur JOBAAS, la plateforme d'annonces et de recherche d'emploie au Cameroun.",
      title: "Créer un compte | Jobaas | Cameroun",
      url: url,
      metaImage: genericMetaImage,
      publishedTime: genericPublishedDate,
      keywords: genericMetaTags,
    };
    htmlData = replaceTagForSEO(htmlData, tagForSEO);
    res.send(htmlData);
  });

  server.get("/fr/login", async (req, res) => {
    res.set("Cache-control", "public, max-age=200");
    let htmlData = fs.readFileSync(indexPath, "utf8");
    const url = req.protocol + "://" + req.get("host") + "/fr/login";
    // inject meta tags
    const tagForSEO = {
      description:
        "Connectez vous à Jobaas la plateforme d'annonces et de recherche d'emploie au Cameroun.",
      title: "Se connecter | Jobaas | Cameroun",
      url: url,
      metaImage: genericMetaImage,
      publishedTime: genericPublishedDate,
      keywords: genericMetaTags,
    };
    htmlData = replaceTagForSEO(htmlData, tagForSEO);
    res.send(htmlData);
  });

  server.get("/fr/jobs", async (req, res) => {
    res.set("Cache-control", "public, max-age=200");
    let htmlData = fs.readFileSync(indexPath, { encoding: "utf8", flag: "r" });
    const url = req.protocol + "://" + req.get("host") + "/fr/jobs";
    // inject meta tags
    const tagForSEO = {
      description:
        "Consultez les annonces d'emploi de Jobaas, la plateforme d'offres et de recherche d'emloi au Cameroun.",
      title: "Annonces d'emploi | Jobaas | Cameroun",
      url: url,
      metaImage: genericMetaImage,
      publishedTime: genericPublishedDate,
      keywords: genericMetaTags,
    };
    htmlData = replaceTagForSEO(htmlData, tagForSEO);
    res.send(htmlData);
  });

  server.get("/fr/contact", async (req, res) => {
    res.set("Cache-control", "public, max-age=200");
    const url = req.protocol + "://" + req.get("host") + "/fr/contact";
    let htmlData = fs.readFileSync(indexPath, "utf8");
    // inject meta tags
    const tagForSEO = {
      description:
        "Contactez nous à travers cette page en remplissant le formulaire s'il vous plait. Vous serez appelé le plus tôt possible.",
      title: "Contactez-nous | Jobaas | Cameroun",
      metaImage: genericMetaImage,
      publishedTime: genericPublishedDate,
      keywords: genericMetaTags,
      url: url,
    };
    htmlData = replaceTagForSEO(htmlData, tagForSEO);
    res.send(htmlData);
  });

  server.get("/fr/blog", async (req, res) => {
    res.set("Cache-control", "public, max-age=200");
    const url = req.protocol + "://" + req.get("host") + "/fr/blog";
    let htmlData = fs.readFileSync(indexPath, { encoding: "utf8", flag: "r" });
    // inject meta tags
    const tagForSEO = {
      description:
        "Retrouvez toutes l'actualité du monde de l'emploi au Cmaeroun sur notre blog. Retrouvez des conseils pour recruter et postuler au Cameroun (les jobs, les stages, les CDI, les entretiens et les CVs) dans notre blog",
      title: "Blog emploi | Jobaas | Cameroun",
      metaImage: genericMetaImage,
      publishedTime: genericPublishedDate,
      keywords: genericMetaTags,
      url: url,
    };
    htmlData = replaceTagForSEO(htmlData, tagForSEO);
    res.send(htmlData);
  });

  server.get("*", async (req, res) => {
    res.set("Cache-control", "public, max-age=200");
    let htmlData = fs.readFileSync(indexPath, "utf8");
    const tagForSEO = {
      description:
        "Job As A Service est une plateforme  de recherche d'emploi au Cameroun. Trouvez un travail grace à Jobaas, trouvez le personnel qualifié",
      title: "Accueil | Jobaas | Cameroun",
      metaImage: genericMetaImage,
      publishedTime: genericPublishedDate,
      keywords: genericMetaTags,
    };
    htmlData = replaceTagForSEO(htmlData, tagForSEO);
    res.send(htmlData);
  });

  // use to access css file
  server.use(express.static(path.join(__dirname, "/../common/pages")));

  // serving html pages
  server.use(
    "/error",
    express.static(path.join(__dirname, "/../common/error/pages"))
  );

  server.use(
    "/.well-known/acme-challenge/LsS3QmXCpsyQB-vFFLZ2PErLHvyT4kbU07TywKVC_KI",
    function (req, res) {
      res.send(
        "LsS3QmXCpsyQB-vFFLZ2PErLHvyT4kbU07TywKVC_KI.VZiBv_X7gC9fFFjUN-8QTPjJ4HcOggq_N0_MiqA2nS4"
      );
    }
  );

  server.post("/report-violation", (req, res) => {
    res.status(200).json({
      message: "XSS ATTACK !",
      warning: "Origin not registered in CSP",
    });
  });
};

module.exports = {
  init: init,
};

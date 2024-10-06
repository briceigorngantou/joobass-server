// libraries
const Hubspot = require('hubspot')
const fs = require('fs');
const path = require('path');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');


// start mongoose connection 
mongoose.connect(config.databaseUri, {
    connectTimeoutMS: 1500,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // sets the delay between every retry (milliseconds)

}).then(
    () => {
        console.log('connected to ' + config.databaseUri);
    });

 
console.log("before function call");
let startDate = new Date() ;
// this function Generate the new jobs summary
const exportnewUsersToHubsplot = async () => {


    try {

        const hubspot = new Hubspot({
          apiKey: '3ff37a9f-02ae-4d66-8a9a-8e811c953fae',
          checkLimit: false // (Optional) Specify whether to check the API limit on each call. Default: true
        })
        const durationInDays = 31 ;
        const test = Math.floor(Math.random()*100)
  
        let lastRun = new Date() ;
        lastRun.setDate(lastRun.getDate() + durationInDays);
 
    /*
      
        var particulars = await particularService.getAllParticulars(0, 0, {}, false);
        console.log(particulars.length+" particulars  ") ;
        console.log("taille "+particulars.particulars[0].skills.length) ;
        for (let particular of particulars.particulars) {

            let contact = {

                "properties": [
                { "property": "email", "value": test+particular.email.value},
    
                { "property": "firstname","value": "TEST__"+test+particular.surname },
                { "property": "lastname","value": particular.name },
    
                { "property": "Origine","value": particular.origin}
                ,
                {
                "property": "phone",
                "value": particular.phoneNumber.value
                },
                {
                "property": "city",
                "value": particular.town
                }
                 ,
                {
                "property": "school",
                "value": particular.skills.length > 0  ? particular.skills : "[]"
                }

                ]
            };

            const hubspotContact = await hubspot.contacts.create(contact);

      

        }

    */


  // Add company 
/*
  let company
   = {

    "properties": [

    { "property": "name","value":" companyname" }
    ]
};
*/
const company = {
    properties: {
        domain: "test",
        name: "name",
        value:"TestJobaas"
    },
    properties: {
        domain: "test",
        name: "TestcompanyOwner",
        value:"Jobaas"
    },
    properties: {
        domain: "test",
        name: "phoneNumber",
        value:"2376917283789"
    },
    properties: {
        domain: "",
        name: "industry",
        value:"TestJobaas"
    }
}

const hubspotContact = await hubspot.companies.create(company);
  /*
  var companies = await companyService.getAllCompanies(0, 0, {}, false);

  for (let company of companies.companies) {

    console.log("test: "+company.name)

    

      let contact = {

          "properties": [

          { "property": "Nom","value":" companyname" }
          ]
      };

      const hubspotContact = await hubspot.companies.create(contact);
      return  ;
  }
  */
  




    } catch (error) {
        console.log(error);
        var endDate = new Date();
        const log =  {
            "name":"exportnewUsersToHubsplot",
            "status":1,
            "startDate":startDate,
            "endStart":endDate,
            "error":error      
        }
        await logService.createLog(log) ;


    }
};
// TODO CREATE A TIMER THAT CALL THE PREVIOUS FUNCTIONS 
exportnewUsersToHubsplot().then(() => {
   
   try{

    process.exit(0)

} catch (error) {
    console.log(error);

    
}

});


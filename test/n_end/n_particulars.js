const config = require('../../configs/environnement/config');

const RoleModel = require('../../configs/models/role');
const particularService = require('../../services/particular');
const jobService = require('../../services/job');
const employerStatService = require('../../services/statsEmployer');
const employeeStatService = require('../../services/statsEmployee');
const marketingService = require('../../services/marketing');
const roleService = require('../../services/role');
const mongoose = require('mongoose');
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const path = require('path');
const should = require('chai').should();
const schoolLevel = require('../../common/utils/enum').schoolLevel;
const tags = require('../../common/utils/enum').tags;

const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const saltRounds = config.sr;

const nbParticulars = 10;
const nbJobs = 30;

mongoose.connect(config.databaseUri, {
    connectTimeoutMS: 1500,
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(
    () => {
        console.log('connected to ' + config.databaseUri);
    });


//const csv = require('csv-parser');

/*
*/

let rawPersons = [];
let rawJobs = [];
let professions = ["student", "engineer", "Lawyer", "Doctor", "muscian", "soccer player", "businessman", "taximan", "transporteur", "avocat", "menusier"]
let partitculars;

var read = fs.readFileSync(path.join(__dirname, '/../../data/mockAfricanNames.csv'));


rawPersons = parse(read, {columns: true}, function (err, records) {
    console.log(records);
});

read = fs.readFileSync(path.join(__dirname, '/../../data/mock_jobs.csv'));
rawJobs = parse(read, {columns: true}, function (err, records) {
    console.log(records);
});


Object.keys(rawJobs[0]).forEach(function (key) {

    console.log(`${key}`);
})

const generateParticulars = async (numberParticulars, FakePersonData, professions) => {

    let birthday;
    let particulars = []
    const permissionLevels = [EMPLOYER, EMPLOYEE]
    var i;
// We generate Employers 
    for (i = 0; i < numberParticulars; i++) {

        console.log(" compteur " + i);
        birthday = new Date("12/06/1998");
        birthday.setDate(birthday.getDate() - Math.floor(Math.random() * 255 * 14))
        //select random  name's index        
        let indexName = Math.floor(Math.random() * (FakePersonData.length - 1));
        // select random  surname's index  
        let indexSurname = Math.floor(Math.random() * (FakePersonData.length - 1));
        currentEmployer = {
            name: FakePersonData[indexName]["Name"],
            surname: FakePersonData[indexSurname]["Name"].toLocaleUpperCase(),
            profession: professions[indexSurname % professions.length],
            description: " I'm a dynacmic " + professions[indexSurname % professions.length] + " looking for opportunities",
            gender: indexName % 3 == 0 ? "Woman" : "Man",
            phoneNumber: {
                value: 33786177031 + Math.floor(Math.random() * 100000),
                valid: true
            },
            email: {
                value: FakePersonData[indexName]["Name"] + Math.floor(Math.random() * 100) + "@yahoo.fr",
                valid: true
            },
            valid: true,
            schoolLevel: schoolLevel[indexSurname % (schoolLevel.length)],
            identityCard: {
                url: "http:/localhost.test.org",
                valid: true
            }
            ,
            password: "string9S#"
            ,
            skills: ["comunication", " Selling", "Marketing"],
            town: FakePersonData[indexName]["Country of Origin"],
            street: FakePersonData[indexSurname]["Country of Origin"],
            state: ['employee', 'employer'],
            birthday: birthday

        }

        currentEmployer = await particularService.createParticular(currentEmployer);
        particulars.push(currentEmployer);

        await employerStatService.createStatsEmployer({userId: currentEmployer['_id']});
        await employeeStatService.createStatsEmployee({userId: currentEmployer['_id']});
        console.log('permissions ' + permissionLevels);
        const newRole = {'userId': currentEmployer['_id'], 'permissionLevel': permissionLevels};
        await roleService.createRole(newRole);
        const newMarketingView = {'userId': currentEmployer['_id'], 'origin': "mockdata"};
        await marketingService.createMarketing(newMarketingView);
        /*
        Object.keys(currentEmployer).forEach(function (key) {

            console.log(`${key} : ${currentEmployer[key]}`);

        })     */

    }

    return particulars;

}


const generateJobs = async (numberJobs, fakeJobData, particulars) => {

    console.log("ici" + particulars)
    let startDate, endDate;
    let jobs = []
    var i;
    // We generate Employers
    for (i = 0; i < numberJobs; i++) {

        startDate = new Date();
        startDate.setDate(startDate.getDate() + 10 + Math.floor(Math.random() * 120))
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 100)
        //select random  name's index
        let indexJob = Math.floor(Math.random() * (fakeJobData.length - 1));
        currentJob = {
            town: fakeJobData[indexJob]["location"],
            street: fakeJobData[indexJob]["organization"],
            referenceStreet: fakeJobData[indexJob]["location"],
            title: fakeJobData[indexJob]["job_title"],
            description: fakeJobData[indexJob]["job_description"],
            employer: particulars[indexJob % particulars.length]["_id"],
            state: "validated",
            isValid: true,
            nbplaces: 1 + Math.floor(Math.random() * 4),
            nbPlacesLeft: 3,
            "startDate": startDate,
            endDate: endDate,
            chooseCandidate: false,
            employerPayment: 10000,
            price: 9000,
            prerequisites: "",
            "tags": tags[indexJob % tags.length],
        }

        jobs.push(currentJob);
        idJob = await jobService.createJob(currentJob);
        currentJob["_id"] = idJob;
        /*
        Object.keys( currentJob).forEach(function (key) {
          console.log(`${key} : ${currentJob[key]}`);
        })*/
    }

    return jobs;

}


(async () => {
    const partitculars = await generateParticulars(nbParticulars, rawPersons, professions);
    const jobs = await generateJobs(nbJobs, rawJobs, partitculars)
})().then(() => {
    console.log("end  particulars generation");
    mongoose.connection.close();
});


/*let partitculars = generateParticulars(2, rawPersons, professions).then(()=>{ console.log("end  particulars generation");
                                                                              mongoose.connection.close() ;
}) ;
*/

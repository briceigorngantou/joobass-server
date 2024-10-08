// Generated by Selenium IDE

const { Builder, By, Key, until, webdriver } = require('selenium-webdriver')
var chrome = require ('selenium-webdriver/chrome');
require('chromedriver')

describe('voir_évaluation', function() {
  this.timeout(300000)
  let driver
  let vars
  beforeEach(async function() {
    driver = new Builder().forBrowser('chrome').setChromeOptions((new chrome.Options).addArguments('--headless').addArguments('--no-sandbox').addArguments('--disable-dev-shm-usage')).build()
    vars = {}
  })
  afterEach(async function() {
    await driver.quit();
  })
  async function testconnexion() {
    await driver.get("https://jobaas-backend-dev.herokuapp.com//")
    await driver.manage().window().setRect({ width: 1366, height: 658 })
    await driver.findElement(By.linkText("Se connecter")).click()
    await driver.sleep(10000)
    await driver.findElement(By.id("email")).sendKeys("elangal@3il.fr")
    await driver.findElement(By.id("password")).sendKeys("string9S#")
    await driver.findElement(By.id("state")).click()
    await driver.findElement(By.css(".ant-select-item-option-active > .ant-select-item-option-content")).click()
    await driver.findElement(By.id("email")).click()
    await driver.findElement(By.id("password")).click()
    await driver.findElement(By.css(".Login_content__DXecL")).click()
    await driver.findElement(By.css(".ant-btn-primary")).click()
  }
  it('voir_évaluation', async function() {
    // Test name: voir_évaluation
    // Step # | name | target | value
    // 1 | run | testconnexion | 
    testconnexion()
    // 2 | setWindowSize | 1936x1096 | 
    await driver.manage().window().setRect({ width: 1936, height: 1096 })
    // 3 | click | linkText=Menu Employé | 
    await driver.sleep(17000)
    await driver.get(driver.getCurrentUrl()) 
    await driver.findElement(By.linkText("Menu Employé")).click()
    // 4 | click | linkText=Evaluations | 
    await driver.sleep(10000)
    await driver.findElement(By.linkText("Evaluations")).click()
    // 5 | click | linkText=Voir l'évaluation | 
    await driver.sleep(10000)
    await driver.findElement(By.linkText("Voir l\'évaluation")).click()
  })
})

const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const axios = require("axios")
const getCompanyName = require("./getCompanyName")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", (req, res) => {
  const {id} = req.params
  axios
    .get(`${config.investmentsServiceUrl}/investments/${id}`)
    .then((response) => {
      // Assume the response is array with one element
      const investments = response.data[0]
      if (
        !Array.isArray(investments.holdings) ||
        investments.holdings.length === 0
      ) {
        res.send("No holdings found")
      }
      return investments
    })
    .then((investments) => {
      const {userId, firstName, lastName, investmentTotal, date, holdings} =
        investments
      return holdings.map((holding) => {
        const {id: companyId, investmentPercentage} = holding
        const value = investmentTotal * investmentPercentage
        return {
          userId,
          firstName,
          lastName,
          date,
          companyId,
          value,
        }
      })
    })
    .then((holdings) => {
      res.json(holdings)
    })
    .catch((err) => {
      console.error(err)
      res.send(500)
    })
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})

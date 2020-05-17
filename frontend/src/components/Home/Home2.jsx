import React, { Component } from "react";
import "antd/dist/antd.css";
import {
  Steps,
  Row,
  Col,
  Button,
  message,
  Form,
  InputNumber,
  Select,
  Typography,
  Divider,
} from "antd";
import "./Home.styles.css";
import { Card } from "react-bootstrap";
import { backendurl } from "../common/settings";
import axios from "axios";
import TickerBar from "../TickerBar/TickerBar";
import TickerTape from "../TickerBar/TickerTape";
import GraphWidget from "../TickerBar/GraphWidget";
import PortfolioGraphs from "../Graphs/PortfolioGraphs";
const queryString = require("query-string");

const { Title, Paragraph, Text } = Typography;

const Step = Steps.Step;
const OPTIONS = [
  {
    key: "ethical",
    value: "Ethical Investing",
  },
  {
    key: "growth",
    value: "Growth Investing",
  },
  {
    key: "index",
    value: "Index Investing",
  },
  {
    key: "quality",
    value: "Quality Investing",
  },
  {
    key: "value",
    value: "Value Investing",
  },
];

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
};

function validateNumber(number) {
  if (number < 5000) {
    return "error";
  }

  return "success";
}

class App extends Component {
  state = {
    current: 0,
    showSubmit: false,
    enableBack: false,
    validateNumberStatus: "success",
    validateOptionStatus: "success",
    amount: 5000,
    selectedItems: [],
    results: {},
  };

  handleNext = () => {
    if (this.state.current === 1 && this.state.selectedItems.length > 2) {
      message.error("Select maximum of 2 Investment strategies");
      this.setState({ validateOptionStatus: "error" });
    } else if (
      this.state.current === 1 &&
      this.state.selectedItems.length === 0
    ) {
      message.error("Please select at-least 1 Investment strategy");
      this.setState({ validateOptionStatus: "error" });
    } else if (this.state.current === 0 && this.state.amount < 5000) {
      message.error("Please select valid amount");
    } else {
      this.setState({ validateOptionStatus: "success" });
      let newVal = this.state.current + 1;
      if (newVal === 2) {
        this.setState({ showSubmit: true });
      }
      this.setState({ current: newVal });
      this.setState({ enableBack: true });
    }
  };

  handleBack = () => {
    let newVal = this.state.current - 1;
    if (newVal === 0) {
      this.setState({ enableBack: false });
    }
    this.setState({ showSubmit: false });
    this.setState({ current: newVal });
  };

  handleSubmit = () => {
    this.setState({ current: 3 });
    message.info("Fetching Results");
    let query = {};
    query.investmentAmount = this.state.amount;
    query.investmentStrategies = this.state.selectedItems;

    console.log("the data sent to backend is" + JSON.stringify(query));

    const stringified = queryString.stringify(query);
    axios
      .post(backendurl + "/stockSuggestions", query)
      .then((response) => {
        console.log(
          "the stock suggestions are " + JSON.stringify(response.data)
        );
        this.setState({
          results: response.data,
        });
      })
      .catch((error) => {
        console.log("the error is" + error);
      });
  };

  handleNumberChange = (value) => {
    this.setState({
      validateNumberStatus: validateNumber(value),
      amount: value,
    });
  };

  handleOptionChange = (selectedItems) => {
    this.setState({
      selectedItems,
    });
  };

  render() {
    const { selectedItems, results } = this.state;
    const formatedSelectedItems = selectedItems.join(" & ");
    const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));
    let displayResults, residue, displayGraph;

    if (results) {
      if (Array.isArray(results.data) && results.data.length) {
        displayResults = results.data.map((result, index) => {
          return (
            <Col key={index}>
              <Card bg="white" style={{ width: "15rem", margin: "1rem" }}>
                <Card.Body>
                  <Card.Title>{result.company}</Card.Title>
                  <Card.Text>
                    <b>Number of stocks: </b>
                    {result.count}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          );
        });

        displayGraph = <PortfolioGraphs results={results} />;
      }
      if (results.residue) {
        residue = results.residue;
      }
    }

    return (
      <div className="home">
        <TickerBar />
        <div className="box effect1 stockCard">
          <Typography>
            <div style={{ textAlign: "center" }}>
              <Title level={2}>
                {" "}
                <a href="/" style={{ color: "#000" }} className="display-4">
                  Stock Suggestor{" "}
                </a>
              </Title>
            </div>
            <Divider />
          </Typography>
          <Row>
            <Col span={20} offset={0}>
              <div className="stepsClass text-light">
                <Steps
                  direction="horizontal"
                  size="small"
                  current={this.state.current}
                >
                  <Step
                    title="Investment Amount"
                    description="Enter Amount in USD"
                  />
                  <Step
                    title="Choose Investment Strategy"
                    description="Choose upto 2 Strategies"
                  />
                  <Step title="Confirm" description="Check Input" />
                </Steps>
              </div>
            </Col>
          </Row>
          <br />
          <br />
          <Row>
            <Col span={10} offset={10}>
              <div className="contentClass">
                <Form {...formItemLayout}>
                  {(this.state.current === 0 && (
                    <div>
                      <Form.Item
                        validateStatus={this.state.validateNumberStatus}
                        help="Amount should be greater than $5000"
                        style={{ width: "100%" }}
                      >
                        <InputNumber
                          placeholder="Enter Amount"
                          defaultValue={5000}
                          value={this.state.amount}
                          formatter={(value) =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          style={{ width: "100%" }}
                          onChange={this.handleNumberChange}
                        />
                      </Form.Item>
                    </div>
                  )) ||
                    (this.state.current === 1 && (
                      <div>
                        <Form.Item
                          help="Pick one or two Investment strategies"
                          validateStatus={this.state.validateOptionStatus}
                          style={{ width: "100%" }}
                        >
                          <Select
                            mode="multiple"
                            placeholder="Investment strategies"
                            value={selectedItems}
                            onChange={this.handleOptionChange}
                            style={{ width: "100%" }}
                          >
                            {filteredOptions.map((item) => (
                              <Select.Option key={item.key} value={item.key}>
                                {item.value}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    )) ||
                    (this.state.current === 2 && (
                      <div>
                        <Text strong>Amount: </Text>{" "}
                        <Text>{this.state.amount}</Text>
                        <br />
                        <Text strong>Investing Strategies: </Text>
                        <Text>{formatedSelectedItems}</Text>
                      </div>
                    ))}
                </Form>
              </div>
            </Col>
          </Row>
          <br />
          <br />
          <Row>
            <Col span={6} offset={9}>
              {!this.state.enableBack && (
                <Button
                  onClick={this.handleBack}
                  style={{ marginRight: 20 }}
                  disabled
                >
                  Back
                </Button>
              )}

              {this.state.enableBack && (
                <Button onClick={this.handleBack} style={{ marginRight: 20 }}>
                  Back
                </Button>
              )}

              {!this.state.showSubmit && (
                <Button type="primary" onClick={this.handleNext}>
                  Next
                </Button>
              )}

              {this.state.showSubmit && (
                <Button type="primary" onClick={this.handleSubmit}>
                  Submit
                </Button>
              )}
            </Col>
          </Row>
        </div>
        <br />
        <Row gutter={[16, 16]} offset={9}>
          {" "}
          {displayResults}{" "}
        </Row>
        {residue ? <Text strong>Residue Amount:{residue} </Text> : ""}

        {displayGraph}

        <br />
        <br />
        <div className="graph" style={{ textAlign: "center" }}>
          <div style={{ width: "300px", marginTop: "5%" }}>
            <h3 className="display-3">Get an overview of stocks</h3>
          </div>
          <GraphWidget />
        </div>
        <div style={{ marginTop: "10%" }}>
          <TickerTape />
        </div>
      </div>
    );
  }
}

export default App;

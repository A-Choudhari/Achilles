import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SalesChart = () => {
  const chartoptions = {
    series: [
      {
        name: "Cookies",
        data: [0, 31, 40, 28, 51, 42, 109, 100],
      },
    ],
    options: {
      chart: {
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        strokeDashArray: 3,
        borderColor: "rgba(0,0,0,0.1)",
      },

      stroke: {
        curve: "smooth",
        width: 1,
      },
      xaxis: {
        categories: [
          "Aug 12",
          "Aug 13",
          "Aug 14",
          "Aug 15",
          "Aug 16",
          "Aug 17",
          "Aug 18",
          "Aug 19",
        ],
      },
    },
  };
  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Cookies Data</CardTitle>
        <CardSubtitle className="text-muted" tag="h6">
          Yearly Cookies Report
        </CardSubtitle>
        <Chart
          type="area"
          width="100%"
          height="390"
          options={chartoptions.options}
          series={chartoptions.series}
        />
      </CardBody>
    </Card>
  );
};

export default SalesChart;

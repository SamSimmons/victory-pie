import React, { PropTypes } from "react";
import { partialRight } from "lodash";
import {
  addEvents,
  Helpers,
  PropTypes as CustomPropTypes,
  Slice,
  VictoryContainer,
  VictoryLabel,
  VictoryTheme,
  VictoryTransition
} from "victory-core";
import PieHelpers from "./helper-methods";

const fallbackProps = {
  endAngle: 360,
  height: 400,
  innerRadius: 0,
  cornerRadius: 0,
  padAngle: 0,
  padding: 30,
  width: 400,
  startAngle: 0,
  colorScale: [
    "#ffffff",
    "#f0f0f0",
    "#d9d9d9",
    "#bdbdbd",
    "#969696",
    "#737373",
    "#525252",
    "#252525",
    "#000000"
  ]
};

class VictoryPie extends React.Component {
  static displayName = "VictoryPie";

  static defaultTransitions = {
    onExit: {
      duration: 500,
      before: () => ({ y: 0, label: " " })
    },
    onEnter: {
      duration: 500,
      before: () => ({ y: 0, label: " " }),
      after: (datum) => ({ y: datum.y, label: datum.label })
    }
  };

  static propTypes = {
    animate: PropTypes.object,
    colorScale: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.oneOf([
        "grayscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"
      ])
    ]),
    containerComponent: PropTypes.element,
    cornerRadius: CustomPropTypes.nonNegative,
    data: PropTypes.array,
    dataComponent: PropTypes.element,
    endAngle: PropTypes.number,
    events: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.oneOf(["data", "labels", "parent"]),
      eventKey: PropTypes.oneOfType([
        PropTypes.func,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      eventHandlers: PropTypes.object
    })),

    eventKey: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string
    ]),
    groupComponent: PropTypes.element,
    height: CustomPropTypes.nonNegative,
    innerRadius: CustomPropTypes.nonNegative,
    labelComponent: PropTypes.element,
    labelRadius: PropTypes.oneOfType([ CustomPropTypes.nonNegative, PropTypes.func ]),
    labels: PropTypes.oneOfType([ PropTypes.func, PropTypes.array ]),
    name: PropTypes.string,
    padAngle: CustomPropTypes.nonNegative,
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number, bottom: PropTypes.number,
        left: PropTypes.number, right: PropTypes.number
      })
    ]),
    sharedEvents: PropTypes.shape({
      events: PropTypes.array,
      getEventState: PropTypes.func
    }),
    standalone: PropTypes.bool,
    startAngle: PropTypes.number,
    style: PropTypes.shape({
      parent: PropTypes.object, data: PropTypes.object, labels: PropTypes.object
    }),
    theme: PropTypes.object,
    width: CustomPropTypes.nonNegative,
    x: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    y: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ])
  };

  static defaultProps = {
    data: [
      { x: "A", y: 1 },
      { x: "B", y: 2 },
      { x: "C", y: 3 },
      { x: "D", y: 1 },
      { x: "E", y: 2 }
    ],
    standalone: true,
    x: "x",
    y: "y",
    dataComponent: <Slice/>,
    labelComponent: <VictoryLabel/>,
    containerComponent: <VictoryContainer/>,
    groupComponent: <g/>,
    theme: VictoryTheme.grayscale
  };

  static getBaseProps = partialRight(PieHelpers.getBaseProps.bind(PieHelpers), fallbackProps);

  renderData(props) {
    const { dataComponent, labelComponent, groupComponent } = props;
    const dataComponents = [];
    const labelComponents = [];
    for (let index = 0, len = this.dataKeys.length; index < len; index++) {
      const dataProps = this.getComponentProps(dataComponent, "data", index);
      dataComponents[index] = React.cloneElement(dataComponent, dataProps);

      const labelProps = this.getComponentProps(labelComponent, "labels", index);
      if (labelProps && labelProps.text !== undefined && labelProps.text !== null) {
        labelComponents[index] = React.cloneElement(labelComponent, labelProps);
      }
    }
    return labelComponents.length > 0 ?
      React.cloneElement(groupComponent, {}, ...dataComponents, ...labelComponents) :
      dataComponents;
  }

  renderContainer(props, group) {
    const { containerComponent } = props;
    const parentProps = this.getComponentProps(containerComponent, "parent", "parent");
    return React.cloneElement(containerComponent, parentProps, group);
  }

  renderGroup(children, style, offset) {
    const { x, y } = offset;
    return React.cloneElement(
      this.props.groupComponent,
      { role: "presentation", style, transform: `translate(${x}, ${y})`},
      children
    );
  }

  shouldAnimate() {
    return Boolean(this.props.animate);
  }

  render() {
    const props = Helpers.modifyProps(this.props, fallbackProps, "pie");

    const { animate, standalone } = props;
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryBar` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.shouldAnimate()) {
      const whitelist = [
        "data", "endAngle", "height", "innerRadius", "cornerRadius", "padAngle", "padding",
        "colorScale", "startAngle", "style", "width"
      ];
      return (
        <VictoryTransition animate={animate} animationWhitelist={whitelist}>
          { React.createElement(this.constructor, props) }
        </VictoryTransition>
      );
    }

    const calculatedProps = PieHelpers.getCalculatedValues(props, fallbackProps);
    const { style, padding, radius } = calculatedProps;
    const offset = { x: radius + padding.left, y: radius + padding.top };
    const children = this.renderData(props);
    const group = this.renderGroup(children, style.parent, offset);
    return standalone ? this.renderContainer(props, group) : group;
  }
}

export default addEvents(VictoryPie);

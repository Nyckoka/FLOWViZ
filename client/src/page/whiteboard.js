import SendIcon from "@mui/icons-material/Send";
import { Box, Button } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  updateEdge,
  useEdgesState,
  useNodesState,
} from "react-flow-renderer";
import Loading from "../component/common/loading";
import ToolNode from "../component/whiteboard/step/toolNode";
import NoResourceFoundException from "../exception/NoResourceFoundException";
import Request from "../service/request";

let id = -1;
const getId = () => `node${++id}`;

const nodeTypes = { tool: ToolNode };

const edgeOptions = {
  animated: true,
  style: {
    stroke: "black",
  },
};

export default function Whiteboard({ config, setDrawerList }) {
  const url = `${config.appProtocol}://${config.address}:${config.port}/tool`;

  const reactFlowWrapper = useRef(null);

  // Whiteboard GUI state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // States if the workflow can be commited
  const [canAdvance, setCanAdvance] = useState(false);

  useEffect(() => {
    console.log(nodes);
    if (!allStepsNamesAreValid(nodes)) {
      setCanAdvance(false);
      return;
    }
    setCanAdvance(true);
  });

  Request(url, {}, NoResourceFoundException, setDrawerList, <Loading />);

  const onNodeSetupUpdate = (nodeId, setup) => {
    setNodes((nds) => {
      return nds.map((node) => {
        if (node.id === nodeId) {
          node.data.setup = setup;
        }
        return node;
      });
    });
  };

  // Set edges
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );
  // Update edges
  const onEdgeUpdate = (oldEdge, newConnection) =>
    setEdges((els) => updateEdge(oldEdge, newConnection, els));

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const toolName = event.dataTransfer.getData("application/reactflow");

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // TODO - change for a requester class
      const uri = `${config.appProtocol}://${config.address}:${config.port}/tool/${toolName}`;
      const request = await fetch(uri);
      const tool = await request.json();

      // Creating new node
      const node = {
        id: getId(),
        type: "tool",
        position: position,
        data: {
          tool: tool,
          setup: { stepName: "", config: {} },
          onNodeUpdate: onNodeSetupUpdate,
        },
      };

      setNodes((nds) => nds.concat(node));
    },
    [reactFlowInstance]
  );

  return (
    <>
      <ReactFlowProvider>
        <div
          className="reactflow-wrapper"
          ref={reactFlowWrapper}
          style={{ height: "90vh", width: "100vw" }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            defaultEdgeOptions={edgeOptions}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onEdgeUpdate={onEdgeUpdate}
            deleteKeyCode={"Delete"}
            nodeTypes={nodeTypes}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background variant="lines" color="#aaa" gap={12} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      <Box
        width="100vw"
        display="flex"
        justifyContent="flex-end"
        alignItems="flex-end"
        padding={2}
      >
        <Button variant="outlined" endIcon={<SendIcon />}>
          Commit
        </Button>
      </Box>
    </>
  );
}

function allStepsNamesAreValid(workflow) {
  return workflow.every(
    (step) => step.data.stepName && step.data.stepName !== ""
  );
}

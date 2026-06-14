function neighbourhoodHighlight(params) {
  allNodes = nodes.get({ returnType: "Object" });
  
  if (params.nodes.length > 0) {
    highlightActive = true;
    let i, j;
    const selectedNode = params.nodes[0];
    const degrees = 2;

    // mark all nodes as hard to read.
    for (const nodeId in allNodes) {
      allNodes[nodeId].color = "rgba(200,200,200,0.5)";
      if (allNodes[nodeId].hiddenLabel === undefined) {
        allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
        allNodes[nodeId].label = undefined;
      }
    }
    const connectedNodes = network.getConnectedNodes(selectedNode);
    let allConnectedNodes = [];

    // get the second degree nodes
    for (i = 1; i < degrees; i++) {
      for (j = 0; j < connectedNodes.length; j++) {
        allConnectedNodes = allConnectedNodes.concat(
          network.getConnectedNodes(connectedNodes[j])
        );
      }
    }

    // all second degree nodes get a different color and their label back
    for (i = 0; i < allConnectedNodes.length; i++) {
      const node = allNodes[allConnectedNodes[i]];
      if (node) {
        node.color = "rgba(150,150,150,0.75)";
        if (node.hiddenLabel !== undefined) {
          node.label = node.hiddenLabel;
          node.hiddenLabel = undefined;
        }
      }
    }

    // all first degree nodes get their own color and their label back
    for (i = 0; i < connectedNodes.length; i++) {
      const node = allNodes[connectedNodes[i]];
      if (node) {
        node.color = nodeColors[connectedNodes[i]];
        if (node.hiddenLabel !== undefined) {
          node.label = node.hiddenLabel;
          node.hiddenLabel = undefined;
        }
      }
    }

    // the main node gets its own color and its label back.
    const mainNode = allNodes[selectedNode];
    if (mainNode) {
      mainNode.color = nodeColors[selectedNode];
      if (mainNode.hiddenLabel !== undefined) {
        mainNode.label = mainNode.hiddenLabel;
        mainNode.hiddenLabel = undefined;
      }
    }
  } else if (highlightActive === true) {
    // reset all nodes
    for (const nodeId in allNodes) {
      allNodes[nodeId].color = nodeColors[nodeId];
      if (allNodes[nodeId].hiddenLabel !== undefined) {
        allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
        allNodes[nodeId].hiddenLabel = undefined;
      }
    }
    highlightActive = false;
  }

  // transform the object into an array and update vis dataset
  const updateArray = [];
  for (const nodeId in allNodes) {
    if (Object.prototype.hasOwnProperty.call(allNodes, nodeId)) {
      updateArray.push(allNodes[nodeId]);
    }
  }
  nodes.update(updateArray);
}

function filterHighlight(params) {
  allNodes = nodes.get({ returnType: "Object" });
  
  if (params.nodes.length > 0) {
    filterActive = true;
    const selectedNodes = params.nodes;

    // hiding all nodes and saving the label
    for (const nodeId in allNodes) {
      allNodes[nodeId].hidden = true;
      if (allNodes[nodeId].savedLabel === undefined) {
        allNodes[nodeId].savedLabel = allNodes[nodeId].label;
        allNodes[nodeId].label = undefined;
      }
    }

    for (let i = 0; i < selectedNodes.length; i++) {
      const node = allNodes[selectedNodes[i]];
      if (node) {
        node.hidden = false;
        if (node.savedLabel !== undefined) {
          node.label = node.savedLabel;
          node.savedLabel = undefined;
        }
      }
    }

  } else if (filterActive === true) {
    // reset all nodes
    for (const nodeId in allNodes) {
      allNodes[nodeId].hidden = false;
      if (allNodes[nodeId].savedLabel !== undefined) {
        allNodes[nodeId].label = allNodes[nodeId].savedLabel;
        allNodes[nodeId].savedLabel = undefined;
      }
    }
    filterActive = false;
  }

  // transform the object into an array and update vis dataset
  const updateArray = [];
  for (const nodeId in allNodes) {
    if (Object.prototype.hasOwnProperty.call(allNodes, nodeId)) {
      updateArray.push(allNodes[nodeId]);
    }
  }
  nodes.update(updateArray);
}

function selectNode(nodeIds) {
  network.selectNodes(nodeIds);
  neighbourhoodHighlight({ nodes: nodeIds });
  return nodeIds;
}

function selectNodes(nodeIds) {
  network.selectNodes(nodeIds);
  filterHighlight({ nodes: nodeIds });
  return nodeIds;
}

function highlightFilter(filter) {
  const selectedNodes = [];
  const selectedProp = filter['property'];
  
  if (filter['item'] === 'node') {
    const localNodes = nodes.get({ returnType: "Object" });
    for (const nodeId in localNodes) {
      if (
        localNodes[nodeId][selectedProp] && 
        filter['value'].includes((localNodes[nodeId][selectedProp]).toString())
      ) {
        selectedNodes.push(nodeId);
      }
    }
  } else if (filter['item'] === 'edge') {
    const localEdges = edges.get({ returnType: 'Object' });
    for (const edgeId in localEdges) {
      if (
        localEdges[edgeId][selectedProp] && 
        filter['value'].includes((localEdges[edgeId][selectedProp]).toString())
      ) {
        selectedNodes.push(localEdges[edgeId]['from']);
        selectedNodes.push(localEdges[edgeId]['to']);
      }
    }
  }
  
  selectNodes(selectedNodes);
}
<p align="center">
  <img width="400" height="200" src="./src/axon-ui/public/img/axon-full-logo-bg.svg">
</p>
<p align="center">
<i>The function of the axon is to transmit information to different neurons - <a href="https://en.wikipedia.org/wiki/Axon">Wikipedia</a></i></p>

---

Axon is a neuron management canister.

## Overview

- An Axon canister controls one or more neurons
- Axons have one or more Principals (operators) that manage its neurons
- `ManageNeuron` commands are sent to Axon, which queues them for voting
- A snapshot of operators is taken at time of submission
- Once a majority of operators vote yes to a proposal, the command is forwarded to all controlled neurons
- Axons can be public and expose all neuron data

## Usage

Deploy an Axon canister:

```sh
dfx deploy Axon --argument 'record {owner= (principal "your-principal-here"); visibility= variant{Public}}'
```

Then, spawn a neuron and set the controller to the Axon canister.

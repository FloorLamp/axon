# Axon

_The function of the axon is to transmit information to different neurons - [Wikipedia](https://en.wikipedia.org/wiki/Axon)._

Axon is a decentralized neuron management canister.

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

import GT "./GovernanceTypes";

module {
  public type ManageOperator = {
    action: {
      #Add;
      #Remove
    };
    principal: Principal
  };

  public type Error = {
    #Unauthorized;
    #NotFound;
    #GovernanceError: GT.GovernanceError;
    #Other: Text;
  };

  public type Request<T> = {
    timestamp: Int;
    creator: Principal;
    request: T;
  }
}

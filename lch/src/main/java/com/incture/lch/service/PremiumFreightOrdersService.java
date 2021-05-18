package com.incture.lch.service;

import java.io.IOException;
import java.util.List;

import org.apache.http.client.ClientProtocolException;
import org.json.JSONException;

import com.incture.lch.adhoc.custom.dto.ResponseMessage;
import com.incture.lch.dto.CarrierDetailsDto;
import com.incture.lch.dto.ChargeRequestDto;
import com.incture.lch.dto.PaginationDto;
import com.incture.lch.dto.PremiumFreightOrderDto;
import com.incture.lch.dto.PremiumOrderAccountingDetailsDto;
import com.incture.lch.dto.PremiumRequestDto;
import com.incture.lch.dto.RejectAtPlannerDto;
import com.incture.lch.dto.ResponseDto;
import com.incture.lch.premium.custom.dto.PremiumCustomDto;
import com.incture.lch.premium.custom.dto.PremiumRequestUserInfoCustomDto;
import com.incture.lch.premium.custom.dto.WorkflowPremiumCustomDto;

public interface PremiumFreightOrdersService {
	public PaginationDto getAllPremiumFreightOrders(PremiumRequestDto premiumRequestDto) throws ClientProtocolException, IOException, JSONException;

	public List<CarrierDetailsDto> getAllCarrierDetails();

	public List<String> getMode(String bpNumber);

/*	public ChargeDetailsPaginated getAllCarrierOrders(PremiumRequestDto premiumRequestDto);
*/
/*	public PaginationDto1 getPlannerOrders(PremiumRequestDto premiumRequestDto) ;
	public ChargeDetailsPaginated getAllManagerOrders(PremiumRequestDto premiumRequestDto) ;
*/	public List<PremiumFreightOrderDto> setCarrierDetails(List<ChargeRequestDto> chargeRequestDto);

	public String setCharge(List<ChargeRequestDto> dto);

	public ResponseDto forwardToApprover(PremiumRequestUserInfoCustomDto  premiumRequestCustomDtos);


	public ResponseDto RejectPremiumOrder(RejectAtPlannerDto dto) ;

	public ResponseMessage updateTableDetails(WorkflowPremiumCustomDto dto) throws ClientProtocolException, JSONException, IOException;

	public ResponseDto addCarrier(CarrierDetailsDto carrierdto);
/*	public List<PremiumCustomDto> getManagerOrders(PremiumRequestDto premiumRequestDto) throws ClientProtocolException, IOException, JSONException;
*/
	public PremiumOrderAccountingDetailsDto getPremiumAccountingDetails(String workflowInstanceId);

	public ResponseDto updatePremiumAccountingDetails(PremiumOrderAccountingDetailsDto accountingDetailsDto);

	public List<PremiumCustomDto> getAllAccountantOrders(PremiumRequestDto premiumRequestDto) throws ClientProtocolException, IOException, JSONException;

}

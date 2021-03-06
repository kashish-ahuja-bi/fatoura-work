import React, { useState, useEffect } from "react";
import { Container, Table } from "react-bootstrap";
import { Input } from "reactstrap";
import ActionBtns from "./ActionBtns";
import './InvoiceTable.css';
import { useDispatch, useSelector } from 'react-redux';
import { getInvoices, getTotalByCurrency, getTotalByCurrencyStatus } from "./pages/Redux/documentsAction";

const InvoiceTable = (props) => {
    const state = useSelector((store) => store.pages);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getInvoices());
        dispatch(getTotalByCurrency());
        dispatch(getTotalByCurrencyStatus('paid'));
        dispatch(getTotalByCurrencyStatus('unpaid'));
        dispatch(getTotalByCurrencyStatus('overdue'));
    }, []);

    const [balanceDue, setBalanceDue] = useState({});
    useEffect(() => {
        var bd;
        if(state.totalByCurrencyStatus.unpaid.data && state.totalByCurrencyStatus.overdue.data) {
            let c1 = state.totalByCurrencyStatus.unpaid;
            let c2 = state.totalByCurrencyStatus.overdue;
            let len = c1.length;
            bd = {...c1};
            for(let i=0; i<len; i++) {
                bd.data[i][0].total = (c1.data[i][0].total + c2.data[i][0].total) +2;
            }
            setBalanceDue(bd);
        }
        else if(state.totalByCurrencyStatus.unpaid.data)
            setBalanceDue(state.totalByCurrencyStatus.unpaid);
        else if(state.totalByCurrencyStatus.overdue.data)
            setBalanceDue(state.totalByCurrencyStatus.overdue);

    }, [state.totalByCurrencyStatus.unpaid, state.totalByCurrencyStatus.overdue]);


    // Filtering Documents
    let invoices = {};
    if(props.parent==="documents") {
        if(props.docStatus ==='Waste Bin') {
            if(state.deletedInvoices.data)
                invoices = state.deletedInvoices.data;
        }
        else if(state.invoices.data){
            if(props.docStatus === 'All Documents')
                invoices = state.invoices.data;
            else 
                invoices = state.invoices.data.filter(item => item.status === props.docStatus);
        }
    }
    else {
        if(state.filteredData.data) 
            invoices = state.filteredData.data;
        else 
            invoices = state.invoices.data;

        if(invoices && invoices.length>0) {
            if(props.docStatus === "All Documents")
                invoices = invoices;
            else 
                invoices = invoices.filter(item => item.status === props.docStatus);

            if(props.docType === "All")
                invoices = invoices;
            else 
                invoices = invoices.filter(item => item.type === props.docType);
        }
    }


    // CheckBox
    var inputElements = document.getElementsByClassName('docCheckbox');
    useEffect(() => {
        if(props.parent==="documents") {
            document.getElementById('rootCheckBox').checked=false;
            handleRootCheck();
        }
        else {
            for(var i=0; inputElements[i]; ++i){
                inputElements[i].checked = false;
            }
        }
    }, [props.docStatus])

    const handleRootCheck = () => {
        var root = document.getElementById('rootCheckBox');
        if(root.checked) {
            for(var i=0; inputElements[i]; ++i){
                inputElements[i].checked = true;
            }
        }
        else {
            for(var j=0; inputElements[j]; ++j){
                inputElements[j].checked = false;
            }
        }
        handleCheck();
    }

    const handleCheck = () => {
        var checkedValue = []; 
        for(let i=0; inputElements[i]; ++i){
            if(inputElements[i].checked){
                checkedValue[i] = inputElements[i].value;
            }
        };
        props.setCheckedDocs(checkedValue);

        if(props.parent==="documents") {
            var checkedLength=0;
            for(let i=0; i<checkedValue.length; i++) {
                if(checkedValue[i] !== undefined) {
                    checkedLength++;
                }
            }
        
            if(checkedLength < inputElements.length) {
                document.getElementById('rootCheckBox').checked=false;
            }
            if(checkedLength === inputElements.length && inputElements.length !== 0) {
                document.getElementById('rootCheckBox').checked=true; 
            }
        }
    }
    
    return (
        <Container fluid className="invoice-table">
            <Table responsive>
                <thead>
                    <tr>
                        {/* <th className="rounded-l">
                            {props.parent === "documents" ? <Input type="checkbox" id="rootCheckBox" onChange={handleRootCheck}></Input> : ''}
                        </th> */}
                        {props.parent === "documents" &&  
                            <th className="rounded-l">
                                <Input type="checkbox" id="rootCheckBox" onChange={handleRootCheck}></Input>
                            </th>
                        }
                        <th className={props.parent === "reports" ? "rounded-l pl25" : "" }>Customer Name</th>
                        <th>Type</th>
                        <th>Invoice #</th>
                        <th>Date Issued</th>
                        <th>Amount</th>
                        <th>Tax</th>
                        <th>Amount Paid</th>
                        <th>Amount Due</th>
                        <th className={props.parent === "reports" ? "rounded-r" : ""}>Total Amount</th>
                        {props.parent === "documents" &&
                            <th className="rounded-r">Actions</th>
                        }
                    </tr>
                </thead>
                {invoices && Object.keys(invoices).length !== 0 &&
                    <tbody>
                        {invoices.map((invoice =>  
                            <tr key={invoice._id}>
                                {props.parent === "documents" &&  
                                    <td>
                                        <Input type="checkbox" className="docCheckbox" name="docCheckbox" value={invoice._id} onChange={handleCheck} ></Input>
                                    </td>
                                }
                                <td className={props.parent === "reports" ? "pl25" : "" }>{invoice.to}</td>
                                <td>{invoice.type}</td>
                                <td>{invoice.invoiceNumber}</td>
                                <td>{new Date(invoice.invoiceDate).toISOString().slice(0,10)}</td>
                                <td className="text-center">{invoice.subTotal === (null || 0) ? "0.00" : invoice.subTotal}{invoice.currencySymbol}</td>
                                <td className="text-center">{invoice.totalTax === (null || 0) ? "0.00" : invoice.totalTax}{invoice.currencySymbol}</td>
                                <td className="text-center">{invoice.receiptAmount == null ? "0.00" : invoice.receiptAmount}{invoice.currencySymbol}</td>      
                                <td className="text-center">{invoice.dueAmount === (null || 0) ? "0.00" : invoice.dueAmount}{invoice.currencySymbol}</td>
                                <td className="text-center">{invoice.totalAmount === (null || 0) ? "0.00" : invoice.totalAmount}{invoice.currencySymbol}</td>
                                {props.parent === "documents" && 
                                    <td>
                                        <ActionBtns id={invoice._id} />
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                }
            </Table>
            <div className="bottom">
                <div className="flex-class">
                    <h5>Total</h5>
                    <div>
                        {state.totalByCurrency.data && state.totalByCurrency.data.map(curr => 
                            <p key={curr[0]._id}><b>{curr[0].total === 0 ? '0.00' : curr[0].total} {curr[0]._id}</b></p>
                        )}
                    </div>
                </div>
                <div className="flex-class">
                    <h5>Paid Amount</h5>
                    <div>
                        {state.totalByCurrencyStatus.paid.data && state.totalByCurrencyStatus.paid.data.map(curr => 
                            <p key={curr[0]._id}><b>{curr[0].total === 0 ? '0.00' : curr[0].total} {curr[0]._id}</b></p>
                        )}
                    </div>
                </div>
                <div className="flex-class">
                    <h5>Balance Due</h5>
                    <div>
                        {balanceDue.data && balanceDue.data.map(curr => 
                            <p key={curr[0]._id}><b>{curr[0].total === 0 ? '0.00' : curr[0].total} {curr[0]._id}</b></p>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default InvoiceTable;

